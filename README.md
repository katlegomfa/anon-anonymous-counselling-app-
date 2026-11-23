# Anon — Anonymous Counselling Access Platform

Privacy-first counselling access prototype for GABS Organisation, based on the supplied Anon App architecture. Includes a responsive website, Node.js backend, installable PWA, Kotlin Android Studio wrapper, Supabase schema and privacy/safeguarding guidance.

The service directory covers the 17 areas in the source architecture. Delivery ideas such as text/video, self-help, crisis intervention, couples/group sessions, peer support, medication referral and insurance are not claims of live services.

## Run locally

Requires Node.js 20+.

```sh
npm start
npm test
```

## Supabase demo intake

The public demo form sends only a selected topic and consent flag. The backend uses the restricted `submit_anon_demo_request` database function and never writes demo entries to local JSONL files. Configure `SUPABASE_URL` and the server-only `SUPABASE_SECRET_KEY` in the deployment environment. Never expose that key to the browser or Android app.

If the secret is not configured, demo intake intentionally returns HTTP 503 and saves nothing. The Supabase table stores only a topic reference, consent version and timestamps. The current 30-day expiry is metadata only; automatic deletion has not yet been scheduled.

## Safety boundary

This is a prototype, not a live clinical service. Do not submit real personal, health, counselling or crisis information. Production requires clinical governance, Botswana privacy/legal review, verified counsellors, safeguarding protocols, tested authorization and independent security testing.

## Knowledge, Botswana evidence and GABS public programme summary

The public site includes:
- `/knowledge.html`: searchable educational guides and an optional seven-day learning prompt. Content is educational and not clinical advice.
- `/statistics.html`: a source-linked evidence centre using WHO Botswana Biennial Report 2024–2025, WHO Mental Health Atlas 2024 and Statistics Botswana's Outpatient Mental Health Disorders 2019 brief. Each value is labelled with its reference year and interpretation limits.
- `/impact.html`: a public summary of GABS's core programme areas, proposed Anon contribution, future measurement indicators and publication safeguards.

The supplied GABS-Public-Organisation-Profile explicitly excludes detailed numerical impact tables. The Anon public impact page therefore does not publish GABS session, reach, beneficiary or outcome figures. Such figures require explicit written GABS authorisation and an approved, dated aggregate dataset before they can be considered for publication.

Use `docs/templates/gabs-impact-data-template.csv` and follow `docs/GABS_IMPACT_DATA_GOVERNANCE.md` for any future approved update. Never place names, beneficiary identifiers, phone numbers, HIV status, diagnoses, case notes or personal stories in the public dataset.
