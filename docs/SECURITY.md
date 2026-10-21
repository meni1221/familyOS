# Shlanu — Security

## Threat Model

### Assets
- User credentials (passwords, session tokens)
- Family personal data (tasks, events, expenses)
- Baby tracking data (health-related)

### Threats
- Unauthorized access to family data
- Cross-family data leakage
- Session hijacking
- CSRF attacks
- NoSQL injection
- XSS attacks
- Unauthorized file access
- Invitation token abuse
- Brute force on authentication

## Security Measures

### Authentication
- Password hashing with bcrypt (cost factor 12+)
- HTTP-only, Secure, SameSite=Strict cookies
- Session tokens with secure random generation
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Account lockout after repeated failures

### Authorization
- Family membership verified on every protected operation
- Role-based access control (OWNER, MEMBER)
- Resource-level authorization (familyId scoping)
- Server-side enforcement (never trust client)
- Immediate access revocation on membership removal

### Session Security
- HTTP-only cookies (not accessible via JavaScript)
- Secure flag (HTTPS only)
- SameSite=Strict (CSRF protection)
- Session expiration and rotation
- Proper logout invalidation

### Input Validation
- Server-side validation on all inputs
- Zod schemas for API boundaries
- Sanitization of user content

### Data Protection
- NoSQL injection prevention via Mongoose (typed schemas, no string-built queries)
- XSS prevention through React escaping
- CSRF tokens for state-changing requests
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Sensitive data never logged

### Invitations
- Cryptographically random tokens
- Token hashing (never store raw tokens)
- Expiration (7 days)
- Single-use enforcement
- Revocation support

### Password Reset
- A 32-byte random token, stored only as a SHA-256 hash
- Expiration (1 hour), enforced in the query and by Mongo's TTL index
- Single-use: redeeming sets `usedAt`, a second attempt is refused
- A new request retires the previous link
- The response is identical whether or not the address has an account
- Every session of the account is revoked on success
- In production the link is never written to the log; without SMTP the request
  is recorded as an error and no mail is sent

### Request Logging
- One line per request: method, path, status, duration, request id
- No request bodies, no cookies, no passwords, no tokens
- `X-Request-Id` is validated before being echoed and logged

### Account Deletion and Export
- The export contains the account and its family data, and no password hash or
  session token
- Deletion requires the account's password, and the session is revoked afterwards
- A non-owner's records stay with the family; an absent assignee is cleared
  rather than left pointing at a deleted user
- A family whose only member leaves is deleted with them — the one case where
  deleting an account deletes family data

### Audit Trail
Not implemented yet: `AuditLog` has a schema but nothing writes to it, so the
project does not claim an audit trail in this document.

## Security Headers
```
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes per IP
- API general: 100 requests per minute per user
- Invitation endpoints: 10 requests per hour per user

## Dependency Security
- Regular `npm audit` scans
- Automated dependency updates
- No known vulnerabilities in production dependencies

## Security Testing
- Cross-family access tests
- Permission boundary tests
- Input validation tests
- Session security tests
- File access authorization tests
