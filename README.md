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
