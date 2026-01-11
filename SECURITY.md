# Security Policy

## Sensitive Data

This project uses environment variables to manage sensitive configuration data.

### Environment Variables

- **Never commit `.env` files** to version control
- Always use `.env.example` as a template
- Required environment variables:
  - `REACT_APP_API_DEPLOYMENT_ID`: Google Apps Script deployment ID

### API Keys and Credentials

- API deployment IDs should be kept confidential
- Use separate deployment IDs for development, staging, and production
- Rotate credentials regularly
- Report any exposed credentials immediately

## Reporting a Vulnerability

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.
