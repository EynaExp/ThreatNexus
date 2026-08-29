#!/usr/bin/env python3
"""
Threat Intelligence & CVE Management Application
Secure, self-contained Flask application with JSON-based storage
"""

import os
import sys
import json
import uuid
import secrets
import hashlib
import hmac
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import (Flask, request, jsonify, session, send_from_directory,
                   render_template_string, redirect, url_for, abort)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix
import base64

app = Flask(__name__, static_folder='static', template_folder='templates')
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

# ── Configuration ──────────────────────────────────────────────────────────────
DATA_FILE = os.environ.get('DATA_FILE', 'data/threat_intel.json')
SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(32))
SESSION_TIMEOUT = int(os.environ.get('SESSION_TIMEOUT', 3600))

app.secret_key = SECRET_KEY
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=SESSION_TIMEOUT)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# ── Data Helpers ───────────────────────────────────────────────────────────────
def load_data():
    if not os.path.exists(DATA_FILE):
        return None
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def save_data(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    tmp = DATA_FILE + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, DATA_FILE)


def init_data_store():
    return {
        "initialized": False,
        "users": {},
        "groups": {},
        "cve_records": [],
        "dashboard_entries": [],
        "credentials": [],
        "cve_custom_columns": [],
        "dashboard_custom_columns": [],
        "credential_custom_columns": [],
        "meta": {"created_at": datetime.utcnow().isoformat()}
    }


def get_data():
    data = load_data()
    if data is None:
        data = init_data_store()
        save_data(data)
    return data


def sanitize(value, max_len=500):
    if not isinstance(value, str):
        return value
    value = value.strip()
    value = re.sub(r'[<>]', '', value)
    return value[:max_len]


# ── Auth Helpers ───────────────────────────────────────────────────────────────
def hash_password(password):
    return generate_password_hash(password, method='pbkdf2:sha256:600000')


def verify_password(stored_hash, password):
    return check_password_hash(stored_hash, password)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        data = get_data()
        user = data['users'].get(session['user_id'])
        if not user or not user.get('active', True):
            session.clear()
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        data = get_data()
        user = data['users'].get(session['user_id'])
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Forbidden'}), 403
        return f(*args, **kwargs)
    return decorated


def current_user():
    data = get_data()
    return data['users'].get(session.get('user_id'))


def user_groups(user):
    return user.get('groups', [])


def can_see_entry(user, entry):
    if user['role'] == 'admin':
        return True
    groups = user_groups(user)
    entry_groups = entry.get('groups', [])
    if not entry_groups:
        return True
    return bool(set(groups) & set(entry_groups))


# ── Security Headers ───────────────────────────────────────────────────────────
@app.after_request
def security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; "
        "img-src 'self' data: https:; "
        "connect-src 'self';"
    )
    return response


# ══════════════════════════════════════════════════════════════════════════════
# API Routes
# ══════════════════════════════════════════════════════════════════════════════

# ── Bootstrap / Status ────────────────────────────────────────────────────────
@app.route('/api/status', methods=['GET'])
def api_status():
    data = get_data()
    return jsonify({'initialized': data.get('initialized', False)})


@app.route('/api/bootstrap', methods=['POST'])
def api_bootstrap():
    data = get_data()
    if data.get('initialized'):
        return jsonify({'error': 'Already initialized'}), 400
    body = request.get_json(force=True)
    username = sanitize(body.get('username', ''))
    password = body.get('password', '')
    if not username or not password or len(password) < 8:
        return jsonify({'error': 'Username and password (min 8 chars) required'}), 400
    uid = str(uuid.uuid4())
    data['users'][uid] = {
        'id': uid,
        'username': username,
        'password_hash': hash_password(password),
        'role': 'admin',
        'groups': [],
        'active': True,
        'created_at': datetime.utcnow().isoformat()
    }
    data['initialized'] = True
    save_data(data)
    return jsonify({'ok': True})


# ── Auth ───────────────────────────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def api_login():
    body = request.get_json(force=True)
    username = sanitize(body.get('username', ''))
    password = body.get('password', '')
    data = get_data()
    user = next((u for u in data['users'].values()
                 if u['username'] == username), None)
    if not user or not verify_password(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    if not user.get('active', True):
        return jsonify({'error': 'Account disabled'}), 403
    session.permanent = True
    session['user_id'] = user['id']
    return jsonify({
        'ok': True,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'groups': user.get('groups', [])
        }
    })


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'ok': True})


@app.route('/api/me', methods=['GET'])
@login_required
def api_me():
    user = current_user()
    return jsonify({
        'id': user['id'],
        'username': user['username'],
        'role': user['role'],
        'groups': user.get('groups', [])
    })


@app.route('/api/change-password', methods=['POST'])
@login_required
def api_change_password():
    body = request.get_json(force=True)
    old_pw = body.get('old_password', '')
    new_pw = body.get('new_password', '')
    if len(new_pw) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    data = get_data()
    user = data['users'].get(session['user_id'])
    if not verify_password(user['password_hash'], old_pw):
        return jsonify({'error': 'Current password incorrect'}), 401
    data['users'][session['user_id']]['password_hash'] = hash_password(new_pw)
    save_data(data)
    return jsonify({'ok': True})


# ── Users (Admin) ──────────────────────────────────────────────────────────────
@app.route('/api/users', methods=['GET'])
@admin_required
def api_list_users():
    data = get_data()
    users = []
    for u in data['users'].values():
        users.append({
            'id': u['id'],
            'username': u['username'],
            'role': u['role'],
            'groups': u.get('groups', []),
            'active': u.get('active', True),
            'created_at': u.get('created_at', '')
        })
    return jsonify(users)


@app.route('/api/users', methods=['POST'])
@admin_required
def api_create_user():
    data = get_data()
    body = request.get_json(force=True)
    username = sanitize(body.get('username', ''))
    password = body.get('password', '')
    role = body.get('role', 'user')
    groups = body.get('groups', [])
    if not username or not password or len(password) < 8:
        return jsonify({'error': 'Username and password (min 8 chars) required'}), 400
    if role not in ('admin', 'user'):
        role = 'user'
    if any(u['username'] == username for u in data['users'].values()):
        return jsonify({'error': 'Username already exists'}), 409
    uid = str(uuid.uuid4())
    data['users'][uid] = {
        'id': uid,
        'username': username,
        'password_hash': hash_password(password),
        'role': role,
        'groups': groups,
        'active': True,
        'created_at': datetime.utcnow().isoformat()
    }
    save_data(data)
    return jsonify({'ok': True, 'id': uid})


@app.route('/api/users/<uid>', methods=['PUT'])
@admin_required
def api_update_user(uid):
    data = get_data()
    if uid not in data['users']:
        return jsonify({'error': 'Not found'}), 404
    body = request.get_json(force=True)
    user = data['users'][uid]
    if 'role' in body and body['role'] in ('admin', 'user'):
        user['role'] = body['role']
    if 'groups' in body:
        user['groups'] = body['groups']
    if 'active' in body:
        user['active'] = bool(body['active'])
    if 'password' in body and body['password']:
        if len(body['password']) < 8:
            return jsonify({'error': 'Password min 8 chars'}), 400
        user['password_hash'] = hash_password(body['password'])
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/users/<uid>', methods=['DELETE'])
@admin_required
def api_delete_user(uid):
    data = get_data()
    if uid == session['user_id']:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    data['users'].pop(uid, None)
    save_data(data)
    return jsonify({'ok': True})


# ── Groups (Admin) ─────────────────────────────────────────────────────────────
@app.route('/api/groups', methods=['GET'])
@login_required
def api_list_groups():
    data = get_data()
    return jsonify(list(data.get('groups', {}).values()))


@app.route('/api/groups', methods=['POST'])
@admin_required
def api_create_group():
    data = get_data()
    body = request.get_json(force=True)
    name = sanitize(body.get('name', ''))
    description = sanitize(body.get('description', ''))
    if not name:
        return jsonify({'error': 'Name required'}), 400
    if any(g['name'] == name for g in data['groups'].values()):
        return jsonify({'error': 'Group exists'}), 409
    gid = str(uuid.uuid4())
    data['groups'][gid] = {
        'id': gid,
        'name': name,
        'description': description,
        'created_at': datetime.utcnow().isoformat()
    }
    save_data(data)
    return jsonify({'ok': True, 'id': gid})


@app.route('/api/groups/<gid>', methods=['DELETE'])
@admin_required
def api_delete_group(gid):
    data = get_data()
    data['groups'].pop(gid, None)
    for user in data['users'].values():
        if gid in user.get('groups', []):
            user['groups'].remove(gid)
    for entry in data.get('dashboard_entries', []):
        if gid in entry.get('groups', []):
            entry['groups'].remove(gid)
    save_data(data)
    return jsonify({'ok': True})


# ── CVE Records ────────────────────────────────────────────────────────────────
@app.route('/api/cve', methods=['GET'])
@login_required
def api_list_cve():
    data = get_data()
    user = current_user()
    records = []
    for r in data.get('cve_records', []):
        if can_see_entry(user, r):
            records.append(r)
    return jsonify({
        'records': records,
        'custom_columns': data.get('cve_custom_columns', [])
    })


@app.route('/api/cve', methods=['POST'])
@login_required
def api_create_cve():
    data = get_data()
    user = current_user()
    body = request.get_json(force=True)
    record = {
        'id': str(uuid.uuid4()),
        'index': len(data['cve_records']) + 1,
        'cve_id': sanitize(body.get('cve_id', '')),
        'severity': sanitize(body.get('severity', 'Unknown')),
        'type': sanitize(body.get('type', '')),
        'description': sanitize(body.get('description', ''), 2000),
        'references': body.get('references', []),
        'poc_codes': body.get('poc_codes', []),
        'country': sanitize(body.get('country', '')),
        'country_code': sanitize(body.get('country_code', '')),
        'tags': body.get('tags', []),
        'groups': body.get('groups', []) if user['role'] == 'admin' else user.get('groups', []),
        'custom': body.get('custom', {}),
        'created_by': user['id'],
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    data['cve_records'].append(record)
    save_data(data)
    return jsonify({'ok': True, 'id': record['id']})


@app.route('/api/cve/<rid>', methods=['PUT'])
@login_required
def api_update_cve(rid):
    data = get_data()
    user = current_user()
    record = next((r for r in data['cve_records'] if r['id'] == rid), None)
    if not record:
        return jsonify({'error': 'Not found'}), 404
    if not can_see_entry(user, record):
        return jsonify({'error': 'Forbidden'}), 403
    body = request.get_json(force=True)
    updatable = ['cve_id', 'severity', 'type', 'description', 'references',
                 'poc_codes', 'country', 'country_code', 'tags', 'custom']
    for field in updatable:
        if field in body:
            if field in ('cve_id', 'severity', 'type', 'description', 'country', 'country_code'):
                record[field] = sanitize(body[field], 2000)
            else:
                record[field] = body[field]
    if user['role'] == 'admin' and 'groups' in body:
        record['groups'] = body['groups']
    record['updated_at'] = datetime.utcnow().isoformat()
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/cve/<rid>', methods=['DELETE'])
@login_required
def api_delete_cve(rid):
    data = get_data()
    user = current_user()
    idx = next((i for i, r in enumerate(data['cve_records']) if r['id'] == rid), None)
    if idx is None:
        return jsonify({'error': 'Not found'}), 404
    if not can_see_entry(user, data['cve_records'][idx]):
        return jsonify({'error': 'Forbidden'}), 403
    data['cve_records'].pop(idx)
    for i, r in enumerate(data['cve_records']):
        r['index'] = i + 1
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/cve/columns', methods=['POST'])
@login_required
def api_add_cve_column():
    data = get_data()
    body = request.get_json(force=True)
    col_name = sanitize(body.get('name', ''))
    if not col_name:
        return jsonify({'error': 'Column name required'}), 400
    if col_name in data.get('cve_custom_columns', []):
        return jsonify({'error': 'Column exists'}), 409
    data.setdefault('cve_custom_columns', []).append(col_name)
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/cve/columns/<col_name>', methods=['DELETE'])
@admin_required
def api_delete_cve_column(col_name):
    data = get_data()
    cols = data.get('cve_custom_columns', [])
    if col_name in cols:
        cols.remove(col_name)
    save_data(data)
    return jsonify({'ok': True})


# ── Dashboard Entries ──────────────────────────────────────────────────────────
@app.route('/api/dashboard', methods=['GET'])
@login_required
def api_list_dashboard():
    data = get_data()
    user = current_user()
    entries = [e for e in data.get('dashboard_entries', []) if can_see_entry(user, e)]
    return jsonify({
        'entries': entries,
        'custom_columns': data.get('dashboard_custom_columns', []),
        'cve_records': [{'id': r['id'], 'cve_id': r['cve_id'], 'severity': r['severity']}
                        for r in data.get('cve_records', []) if can_see_entry(user, r)]
    })


@app.route('/api/dashboard', methods=['POST'])
@login_required
def api_create_dashboard():
    data = get_data()
    user = current_user()
    body = request.get_json(force=True)
    entry = {
        'id': str(uuid.uuid4()),
        'index': len(data['dashboard_entries']) + 1,
        'host': sanitize(body.get('host', '')),
        'ip': sanitize(body.get('ip', '')),
        'port': sanitize(body.get('port', '')),
        'protocol': sanitize(body.get('protocol', '')),
        'service': sanitize(body.get('service', '')),
        'os': sanitize(body.get('os', '')),
        'status': sanitize(body.get('status', 'Unknown')),
        'notes': sanitize(body.get('notes', ''), 5000),
        'tags': body.get('tags', []),
        'cve_refs': body.get('cve_refs', []),
        'country': sanitize(body.get('country', '')),
        'country_code': sanitize(body.get('country_code', '')),
        'groups': body.get('groups', []) if user['role'] == 'admin' else user.get('groups', []),
        'custom': body.get('custom', {}),
        'created_by': user['id'],
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    data['dashboard_entries'].append(entry)
    save_data(data)
    return jsonify({'ok': True, 'id': entry['id']})


@app.route('/api/dashboard/<eid>', methods=['PUT'])
@login_required
def api_update_dashboard(eid):
    data = get_data()
    user = current_user()
    entry = next((e for e in data['dashboard_entries'] if e['id'] == eid), None)
    if not entry:
        return jsonify({'error': 'Not found'}), 404
    if not can_see_entry(user, entry):
        return jsonify({'error': 'Forbidden'}), 403
    body = request.get_json(force=True)
    str_fields = ['host', 'ip', 'port', 'protocol', 'service', 'os', 'status', 'country', 'country_code']
    for field in str_fields:
        if field in body:
            entry[field] = sanitize(body[field])
    if 'notes' in body:
        entry['notes'] = sanitize(body['notes'], 5000)
    if 'tags' in body:
        entry['tags'] = body['tags']
    if 'cve_refs' in body:
        entry['cve_refs'] = body['cve_refs']
    if 'custom' in body:
        entry['custom'] = body['custom']
    if user['role'] == 'admin' and 'groups' in body:
        entry['groups'] = body['groups']
    entry['updated_at'] = datetime.utcnow().isoformat()
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/dashboard/<eid>', methods=['DELETE'])
@login_required
def api_delete_dashboard(eid):
    data = get_data()
    user = current_user()
    idx = next((i for i, e in enumerate(data['dashboard_entries']) if e['id'] == eid), None)
    if idx is None:
        return jsonify({'error': 'Not found'}), 404
    if not can_see_entry(user, data['dashboard_entries'][idx]):
        return jsonify({'error': 'Forbidden'}), 403
    data['dashboard_entries'].pop(idx)
    for i, e in enumerate(data['dashboard_entries']):
        e['index'] = i + 1
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/dashboard/columns', methods=['POST'])
@login_required
def api_add_dashboard_column():
    data = get_data()
    body = request.get_json(force=True)
    col_name = sanitize(body.get('name', ''))
    if not col_name:
        return jsonify({'error': 'Column name required'}), 400
    data.setdefault('dashboard_custom_columns', []).append(col_name)
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/dashboard/columns/<col_name>', methods=['DELETE'])
@admin_required
def api_delete_dashboard_column(col_name):
    data = get_data()
    cols = data.get('dashboard_custom_columns', [])
    if col_name in cols:
        cols.remove(col_name)
    save_data(data)
    return jsonify({'ok': True})


# ── Credentials ────────────────────────────────────────────────────────────────
@app.route('/api/credentials', methods=['GET'])
@login_required
def api_list_credentials():
    data = get_data()
    user = current_user()
    creds = [c for c in data.get('credentials', []) if can_see_entry(user, c)]
    return jsonify({
        'credentials': creds,
        'custom_columns': data.get('credential_custom_columns', [])
    })


@app.route('/api/credentials', methods=['POST'])
@login_required
def api_create_credential():
    data = get_data()
    user = current_user()
    body = request.get_json(force=True)
    cred = {
        'id': str(uuid.uuid4()),
        'index': len(data['credentials']) + 1,
        'service': sanitize(body.get('service', '')),
        'host': sanitize(body.get('host', '')),
        'port': sanitize(body.get('port', '')),
        'username': sanitize(body.get('username', '')),
        'password': body.get('password', ''),
        'domain': sanitize(body.get('domain', '')),
        'notes': sanitize(body.get('notes', ''), 2000),
        'tags': body.get('tags', []),
        'groups': body.get('groups', []) if user['role'] == 'admin' else user.get('groups', []),
        'custom': body.get('custom', {}),
        'created_by': user['id'],
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    data['credentials'].append(cred)
    save_data(data)
    return jsonify({'ok': True, 'id': cred['id']})


@app.route('/api/credentials/<cid>', methods=['PUT'])
@login_required
def api_update_credential(cid):
    data = get_data()
    user = current_user()
    cred = next((c for c in data['credentials'] if c['id'] == cid), None)
    if not cred:
        return jsonify({'error': 'Not found'}), 404
    if not can_see_entry(user, cred):
        return jsonify({'error': 'Forbidden'}), 403
    body = request.get_json(force=True)
    str_fields = ['service', 'host', 'port', 'username', 'domain']
    for field in str_fields:
        if field in body:
            cred[field] = sanitize(body[field])
    if 'password' in body:
        cred['password'] = body['password']
    if 'notes' in body:
        cred['notes'] = sanitize(body['notes'], 2000)
    if 'tags' in body:
        cred['tags'] = body['tags']
    if 'custom' in body:
        cred['custom'] = body['custom']
    if user['role'] == 'admin' and 'groups' in body:
        cred['groups'] = body['groups']
    cred['updated_at'] = datetime.utcnow().isoformat()
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/credentials/<cid>', methods=['DELETE'])
@login_required
def api_delete_credential(cid):
    data = get_data()
    user = current_user()
    idx = next((i for i, c in enumerate(data['credentials']) if c['id'] == cid), None)
    if idx is None:
        return jsonify({'error': 'Not found'}), 404
    if not can_see_entry(user, data['credentials'][idx]):
        return jsonify({'error': 'Forbidden'}), 403
    data['credentials'].pop(idx)
    for i, c in enumerate(data['credentials']):
        c['index'] = i + 1
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/credentials/columns', methods=['POST'])
@login_required
def api_add_credential_column():
    data = get_data()
    body = request.get_json(force=True)
    col_name = sanitize(body.get('name', ''))
    if not col_name:
        return jsonify({'error': 'Column name required'}), 400
    data.setdefault('credential_custom_columns', []).append(col_name)
    save_data(data)
    return jsonify({'ok': True})


@app.route('/api/credentials/columns/<col_name>', methods=['DELETE'])
@admin_required
def api_delete_credential_column(col_name):
    data = get_data()
    cols = data.get('credential_custom_columns', [])
    if col_name in cols:
        cols.remove(col_name)
    save_data(data)
    return jsonify({'ok': True})


# ── Stats for Globe ────────────────────────────────────────────────────────────
@app.route('/api/stats/countries', methods=['GET'])
@login_required
def api_country_stats():
    data = get_data()
    user = current_user()
    stats = {}

    for entry in data.get('dashboard_entries', []):
        if not can_see_entry(user, entry):
            continue
        cc = entry.get('country_code', '') or entry.get('country', '')
        if not cc:
            continue
        if cc not in stats:
            stats[cc] = {
                'country': entry.get('country', cc),
                'country_code': cc,
                'access_count': 0,
                'cve_count': 0,
                'services': set(),
                'cve_types': set()
            }
        stats[cc]['access_count'] += 1
        for cve_id in entry.get('cve_refs', []):
            cve = next((r for r in data.get('cve_records', []) if r['id'] == cve_id), None)
            if cve:
                stats[cc]['cve_count'] += 1
                if cve.get('type'):
                    stats[cc]['cve_types'].add(cve['type'])
        if entry.get('service'):
            stats[cc]['services'].add(entry['service'])

    result = []
    for cc, s in stats.items():
        result.append({
            'country': s['country'],
            'country_code': s['country_code'],
            'access_count': s['access_count'],
            'cve_count': s['cve_count'],
            'services': list(s['services']),
            'cve_types': list(s['cve_types'])
        })
    return jsonify(result)


# ── Serve Frontend ─────────────────────────────────────────────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.template_folder, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    print(f"[*] Starting Threat Intel App on port {port}")
    print(f"[*] Data file: {DATA_FILE}")
    app.run(host='0.0.0.0', port=port, debug=debug)
