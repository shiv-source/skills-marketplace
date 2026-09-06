# OWASP Top 10

Quick-reference for the OWASP Top 10 (2021) web application risks and their mitigations. Use only the section relevant to the code in front of you.

## A01 Broken Access Control

- Enforce authorization on every request, server-side — never rely on hidden UI or client-side checks.
- Use deny-by-default: a request is denied unless explicitly allowed; verify object-level ownership (`WHERE id = $1 AND user_id = $2`).
- Enforce least privilege in code paths and in the database (restrictive roles, row-level security where warranted).
- Reject by default when a request lacks an explicit allow; avoid CORS with `*` and unused CORS headers.
- Force logout/session invalidation on password change; bind sessions to the user agent/IP where it matters.

## A02 Cryptographic Failures

- Never invent crypto: use battle-tested libraries (`argon2id`/`bcrypt` for passwords, libsodium/Tink for primitives).
- Protect data in transit with TLS everywhere, and at rest with strong, well-keyed encryption (AES-256-GCM).
- Store passwords hashed with a slow, salted KDF; use per-record random salts; never log or store plaintext secrets.
- Rotate keys, prefer short-lived tokens, and store secrets in a secrets manager with env-injected credentials.
- Use random values only from a CSPRNG (`crypto/rand`, `random.bytes`); never `Math.random`/`time.Now` for security.

## A03 Injection

- Parameterize all SQL/query-language statements; never concatenate user input into SQL, LDAP, or shell commands.
- For unsafe-deserialization formats (XML, YAML) use safe parsers and disable external entities (`XXE`).
- Escape output into its context: HTML, attribute, URL, JSON, and SQL each need their own encoding.
- Validate input at the trust boundary: type, length, charset, allowed set — reject unknown or malformed fields.
- Prefer ORMs/query builders that parameterize by default; audit any raw query string construction.

## A04 Insecure Design

- Threat model the feature before building: who attacks, what's the asset, what's the attack surface?
- Build security into the design, not a retrofit: rate limits, quotas, and abuse controls are design decisions.
- Handle failure states safely: a failed auth check must fail closed, never open.
- Design for misuse: assume clients are adversarial (missing fields, out-of-range values, duplicate submissions).

## A05 Security Misconfiguration

- Turn off verbose errors in production; return generic messages and log details server-side only.
- Keep defaults safe: no default credentials, least-privilege DB roles, restrictive file permissions.
- Set secure headers: `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, `frame-ancestors`.
- Remove development/debug endpoints and sample data from production builds; scan dependencies in CI.
- Run a security scanner (ZAP, trivy, npm audit) and treat findings with severity before merge.

## A06 Vulnerable & Outdated Components

- Track every dependency; pin/audit versions and update on a cadence, not just at release time.
- Remove unused dependencies and components entirely — less attack surface.
- Scan the SBOM/dependency lockfile in CI for known CVEs and fail on high severity with a plan.
- Only introduce dependencies the codebase actually needs; prefer maintained, boring libraries over trendy ones.

## A07 Identification & Authentication Failures

- Use a strong, standard password policy plus multi-factor for sensitive actions; never implement custom auth from scratch.
- Rate-limit and lock out login attempts with exponential backoff to blunt credential stuffing and brute force.
- Session management: expiring, cryptographically random session IDs; invalidate on logout and on password change.
- Protect against automated attacks with CAPTCHA/device checks on signup and high-risk flows; never reveal which field was wrong ("user not found" vs "wrong password").

## A08 Software & Data Integrity Failures

- Verify the integrity of code and CI/CD: sign commits, protect the build pipeline, review third-party actions.
- Deserialize only trusted data; validate schema and provenance before processing untrusted input.
- Treat client-supplied data as untrusted end-to-end: an ID from the URL is a hint, not an authorization.
- Use signed, verifiable artifacts for deployments and dependency downloads.

## A09 Logging & Monitoring Failures

- Log security-relevant events: auth success/failure, authorization denials, input validation failures, server errors.
- Include enough context to investigate (request id, user id, timestamp) but never secrets, tokens, or PII.
- Alert on anomalies: mass 401s/403s, spikes in validation failures, unexpected error rates.
- Ensure logs are append-only and integrity-protected where tampering is a concern; monitor the monitors.

## A10 Server-Side Request Forgery (SSRF)

- Validate and allow-list destinations for any URL the server fetches (user-supplied URLs, webhooks, image proxies).
- Block internal/private IP ranges and loopback (127.0.0.0/8, 169.254.0.0/16, 10/8, 172.16/12, 192.168/16, ::1).
- Resolve DNS and re-check the IP after resolution; use an explicit proxy/eGRESS policy for outbound requests.
- Never fetch based on raw user input without a scheme/host allow-list; consider `no-callback`/network-level egress controls.
