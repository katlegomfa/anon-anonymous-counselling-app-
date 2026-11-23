const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, 'public');
const REQUEST_LIMIT = 16 * 1024;
const CONSENT_VERSION = 'anon-demo-v1';
const services = [
  'Online therapy', 'Depression support', 'OCD support', 'Anxiety support',
  "Men's wellbeing", 'Relationship counselling', 'Self-esteem support',
  'Grief counselling', 'Maternal mental health', 'LGBTQIA+ affirming support',
  'Addiction counselling', 'Mental-health assessments', 'HIV/AIDS counselling',
  'Gambling-harm support',
  'Relationship therapy (CBT, emotion-focused and communication approaches)',
  "Veterans' support", 'Postpartum mental health'
];
const methods = [
  'Text and video therapy', 'Self-help tools', 'Crisis intervention',
  'Couples therapy', 'Group sessions', 'Peer support',
  'Medication-management referral', 'Live video sessions', 'Insurance guidance'
];
const resources = [
  { title: 'Grounding: 5–4–3–2–1', description: 'Notice five things you see, four you feel, three you hear, two you smell and one you taste. Stop if it increases distress.' },
  { title: 'Slow breathing', description: 'If comfortable, breathe gently and naturally. Try a slightly longer exhale; stop if you feel dizzy or uncomfortable.' },
  { title: 'Reach out to someone', description: 'Consider contacting a trusted person and telling them what kind of support would help right now.' }
];

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const demoIntakeConfigured = Boolean(supabaseUrl && supabaseSecret);

function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"
  };
}
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    ...securityHeaders(),
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let rejected = false;
    req.on('data', chunk => {
      if (rejected) return;
      raw += chunk.toString('utf8');
      if (Buffer.byteLength(raw) > REQUEST_LIMIT) {
        rejected = true;
        reject(Object.assign(new Error('Request too large'), { status: 413 }));
      }
    });
    req.on('end', () => {
      if (rejected) return;
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); }
    });
    req.on('error', error => { if (!rejected) reject(error); });
  });
}
function safeText(value, max = 180) {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, max) : '';
}
async function submitDemoRequest(service) {
  if (!demoIntakeConfigured) {
    const error = new Error('Secure demo storage is not configured yet. No request was saved. Please try again later.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(supabaseUrl + '/rest/v1/rpc/submit_anon_demo_request', {
    method: 'POST',
    headers: {
      apikey: supabaseSecret,
      Authorization: 'Bearer ' + supabaseSecret,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ p_service_title: service, p_consent_version: CONSENT_VERSION }),
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) {
    const error = new Error('Secure request storage is temporarily unavailable. No request was confirmed.');
    error.status = response.status >= 500 ? 503 : 400;
    throw error;
  }
  const reference = await response.json();
  if (typeof reference !== 'string' || !/^[0-9a-f-]{36}$/i.test(reference)) {
    const error = new Error('The secure service returned an unexpected response. No request was confirmed.');
    error.status = 503;
    throw error;
  }
  return reference;
}
function serveStatic(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const full = path.resolve(PUBLIC, requested);
  if (!full.startsWith(PUBLIC + path.sep) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404, securityHeaders());
    return res.end('Not found');
  }
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };
  res.writeHead(200, {
    ...securityHeaders(),
    'Content-Type': types[path.extname(full)] || 'application/octet-stream',
    'Cache-Control': path.extname(full) === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(full).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && pathname === '/api/health') {
      return json(res, 200, {
        status: 'ok', app: 'Anon', mode: 'prototype',
        demoIntakeConfigured
      });
    }
    if (req.method === 'GET' && pathname === '/api/catalog') {
      return json(res, 200, { services, methods, resources });
    }
    if (req.method === 'POST' && pathname === '/api/requests') {
      const body = await readBody(req);
      if (body.consent !== true) return json(res, 400, { error: 'Please confirm the privacy notice before continuing.' });
      const service = safeText(body.service);
      if (!services.includes(service)) return json(res, 400, { error: 'Choose a support area from the list.' });
      const reference = await submitDemoRequest(service);
      return json(res, 201, {
        reference,
        status: 'demo-request-received',
        message: 'Your minimal demonstration entry was securely recorded. It does not connect you to a counsellor.'
      });
    }
    if (req.method === 'POST' && pathname === '/api/crisis') {
      const body = await readBody(req);
      if (body.confirmed !== true) return json(res, 400, { error: 'Confirmation required.' });
      return json(res, 200, {
        message: 'If you or someone else may be in immediate danger, contact local emergency services or go to the nearest emergency department now. Do not wait for this app. If possible, stay with a trusted person.',
        status: 'guidance-only'
      });
    }
    if (req.method === 'GET') return serveStatic(req, res);
    return json(res, 404, { error: 'Route not found' });
  } catch (err) {
    if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : 'Internal server error' });
  }
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log('Anon prototype listening on ' + PORT));
}
module.exports = { server, services, demoIntakeConfigured, submitDemoRequest };
