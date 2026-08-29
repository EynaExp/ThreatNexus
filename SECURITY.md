# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in ThreatNexus, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email the maintainers directly or use GitHub's private vulnerability reporting feature.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x | Yes |

## Security Best Practices

When deploying ThreatNexus:

- Run the application behind a reverse proxy (e.g., nginx) in production
- Use HTTPS in production environments
- Restrict network access to trusted users
- Regularly back up the `data/threat_intel.json` file
- Keep Python and Flask updated to the latest versions
- The `data/threat_intel.json` file contains sensitive data — ensure proper file permissions (`chmod 600`)
- Do not expose the application directly to the internet without proper hardening
