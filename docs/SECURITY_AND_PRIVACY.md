# Anon security, privacy and safeguarding

## Current state
Anon is a prototype, not a clinical service. It must not receive real personal identifiers, contact details, diagnoses, HIV status, medications, counselling narratives or crisis disclosures.

## Demo intake architecture
- The browser submits only a selected support topic and consent flag.
- The backend rejects requests unless consent is true and the topic matches the active catalogue.
- Demo intake is disabled unless a server-only Supabase secret key and project URL are configured.
- When configured, the backend calls a restricted database function. The database stores only the selected catalogue topic, consent-version identifier, generated reference and timestamps.
- The demo table has RLS enabled, no client policies, and no privileges for anon/authenticated roles. Only the server-side service role can execute the insert function.
- Demo records receive an `expires_at` timestamp 30 days after creation. **Automatic deletion is not yet scheduled**; an approved retention job must be configured and tested before real users.
- No name, email, telephone number, IP address, health narrative or crisis detail is collected by the demo intake endpoint.
- If the server secret is missing or Supabase is unavailable, the API returns an error and does not fall back to local file storage.

## Server configuration
Set these variables in the Render service environment:
- `SUPABASE_URL=https://pgfrzbvebtucgdlhxlla.supabase.co`
- `SUPABASE_SECRET_KEY=sb_secret_...` (preferred modern server-only key). The legacy `SUPABASE_SERVICE_ROLE_KEY` is accepted only as a migration fallback.

Never put a Supabase secret key in GitHub source, browser JavaScript, the PWA, Android assets, or a public issue. Do not paste the key into chat. Add it directly in Render's Environment settings and redeploy. A secret key bypasses RLS, so the backend uses it only for the narrowly scoped RPC operation.

## Required before production
- Botswana legal and privacy review, lawful basis, approved privacy notice and data-protection impact assessment.
- Clinical governance, qualified clinical oversight, professional registration and counsellor verification.
- Approved crisis escalation protocol with named human operators, operating hours and local emergency referrals. No implication of 24/7 monitoring.
- Data minimisation, approved retention/deletion schedule, encryption in transit and at rest, key rotation and tested backups.
- Secure authentication, MFA for staff, least-privilege access, tested row-level security and audit monitoring.
- Rate limiting, abuse prevention, incident response, vulnerability management and independent penetration testing.
- Accessibility testing, consent lifecycle, safeguarding for minors and vulnerable people, and clear service boundaries.
- Integration tests proving the RPC can be called only with the server secret and that public roles cannot read or write intake rows.
- Automated expiry purge with monitoring, and an approved process for user data requests if the scope expands.

## Prototype constraints
The Supabase schema is a foundation only. Appointments, conversations, messages, counsellor verification and clinical workflows are not connected to the public app. Never claim that counsellors, bookings, therapy, emergency monitoring, prescriptions or insurance processing are available.
