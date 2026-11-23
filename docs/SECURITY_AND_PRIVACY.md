# Anon security, privacy and safeguarding

## Current state
This is an early prototype. It is not a clinical service and must not receive real personal identifiers, contact details, diagnoses, HIV status, medications, counselling narratives or crisis disclosures.

## Required before production
- Botswana legal and privacy review, lawful basis, privacy notice and data-protection impact assessment.
- Clinical governance, qualified clinical oversight, professional registration and counsellor verification.
- Approved crisis escalation protocol with named human operators, operating hours and local emergency referrals. No implication of 24/7 monitoring.
- Data minimisation, retention/deletion schedule, encryption in transit and at rest, key rotation and tested backups.
- Secure authentication, MFA for staff, least-privilege access, tested row-level security and audit monitoring.
- Rate limiting, abuse prevention, incident response, vulnerability management and independent penetration testing.
- Accessibility testing, consent lifecycle, safeguarding for minors and vulnerable people, and clear service boundaries.

## Prototype constraints
The demo intake stores limited metadata in local JSONL and is not suitable for production or multi-instance hosting. The Supabase schema is a foundation only; policies need integration tests using authenticated client, counsellor and administrator roles. Never place service-role secrets in frontend or Android code.
