---
name: Security Hardening
description: Apply OWASP-informed secure coding and threat modeling to every trust boundary
references: [owasp]
tags: [security, owasp, threat-modeling]
tools: [bash]
effort: high
---
# Security Hardening

## Purpose

Apply secure-coding practices informed by the OWASP Top 10 and threat modeling. Security is a first-class concern of every change, not an afterthought.

## When to use

- A task handles user input, authentication, authorization, secrets, or untrusted data.
- A task touches SQL, rendering/HTML output, deserialization, or external URL fetching.
- A task introduces a new endpoint, dependency, or data flow across a trust boundary.

## Procedure

1. Model the threat: who are the attackers, what are the assets, what is the attack surface?
2. Read `references/owasp.md` and review the change against each relevant risk.
3. Review the change item by item: input validation, injection, authN/Z, secrets, output encoding, deserialization, dependencies, rate limiting, logging.
4. For each finding, describe the exploit scenario and a concrete mitigation — then apply it.
5. Verify the fix: attempt the attack path and confirm it is blocked (a unit or integration test that proves it).

## References

- `references/owasp.md` — the OWASP Top 10 risks and their mitigations

## Guardrails

- Never trust client-supplied values; validate everything at the trust boundary.
- Parameterize all queries; never concatenate user input into SQL, shell, or LDAP.
- Never commit, log, or render secrets; prefer environment-injected credentials.
- Balance security with usability; recommend proportional, defense-in-depth mitigations for high-value actions.

## Done when

- Every trust-boundary path is validated and authorization is enforced server-side.
- Findings from the threat model are addressed with a test that proves the fix.
- No secrets appear in code, logs, or commit history; residual risk is documented honestly.
