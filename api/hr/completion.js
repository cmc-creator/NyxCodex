/**
 * DSH Training Platform — REST Completion Query API
 *
 * Allows HR systems to pull training completion status for any employee.
 * Supports: ADP WorkforceNow, Paycom, Paycor, Workday, BambooHR, UKG,
 *           any system that can make an HTTP GET request.
 *
 * ─── Setup (one-time, in Vercel project → Settings → Environment Variables) ───
 *   FIREBASE_DB_URL     — e.g. https://your-project-default-rtdb.firebaseio.com
 *   FIREBASE_DB_SECRET  — Firebase Realtime Database legacy secret (Firebase Console
 *                         → Project Settings → Service Accounts → Database Secrets)
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────────
 *   GET /api/hr/completion
 *     Required headers or query params:
 *       X-API-Key: <your-api-key>  OR  ?apiKey=<your-api-key>
 *       ?orgId=<your-org-id>       (find this in tenant.config.js or Firebase)
 *
 *     Optional filters:
 *       ?email=employee@company.com    — single employee lookup
 *       ?department=Nursing            — filter by department
 *       ?status=completed|in_progress|not_started
 *
 * ─── Response ───────────────────────────────────────────────────────────────────
 *   {
 *     "ok": true,
 *     "count": 42,
 *     "generatedAt": "2026-02-20T12:00:00.000Z",
 *     "results": [
 *       {
 *         "uid": "firebase-uid",
 *         "email": "john@company.com",
 *         "firstName": "John",
 *         "lastName": "Doe",
 *         "department": "Psychiatric Unit A",
 *         "employeeId": "EMP-00123",
 *         "trainingStatus": "completed",       // completed | in_progress | not_started
 *         "completedAt": "2026-01-15T09:32:00.000Z",
 *         "completionDate": "January 15, 2026",
 *         "quizScore": null,
 *         "xp": 4200,
 *         "level": 7,
 *         "currentSlide": 27,
 *         "labCredits": 850,
 *         "dueDate": "2026-03-01T00:00:00.000Z",
 *         "lastLogin": "2026-02-18T14:22:00.000Z"
 *       }
 *     ]
 *   }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-Key, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed. Use GET.' });

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const apiKey = (req.headers['x-api-key'] || req.query.apiKey || '').trim();
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API key.',
      hint: 'Pass X-API-Key header or ?apiKey= query parameter. Generate a key in the Admin → Settings → HR Integrations panel.'
    });
  }

  const orgId = (req.query.orgId || '').trim();
  if (!orgId) {
    return res.status(400).json({
      error: 'Missing ?orgId parameter.',
      hint: 'Find your orgId in tenant.config.js or in the Firebase console under orgs/.'
    });
  }

  // ── Server config ─────────────────────────────────────────────────────────────
  const dbSecret = process.env.FIREBASE_DB_SECRET;
  const dbBase   = (process.env.FIREBASE_DB_URL || '').replace(/\/$/, '');

  if (!dbSecret || !dbBase) {
    return res.status(503).json({
      error: 'Server not configured.',
      hint: 'Add FIREBASE_DB_SECRET and FIREBASE_DB_URL to Vercel environment variables. See api/hr/completion.js header for instructions.'
    });
  }

  const fb = (path) => `${dbBase}/orgs/${orgId}/${path}.json?auth=${dbSecret}`;

  try {
    // ── Validate API key ────────────────────────────────────────────────────────
    const keyRes  = await fetch(fb('settings/apiKey'));
    const storedKey = await keyRes.json();
    if (!storedKey || storedKey !== apiKey) {
      return res.status(401).json({ error: 'Invalid API key.' });
    }

    // ── Fetch users ─────────────────────────────────────────────────────────────
    const usersRes = await fetch(fb('users'));
    const users    = await usersRes.json();
    if (!users) return res.status(200).json({ ok: true, count: 0, generatedAt: new Date().toISOString(), results: [] });

    // ── Format ──────────────────────────────────────────────────────────────────
    let results = Object.entries(users).map(([uid, u]) => ({
      uid,
      email:          u.email        || null,
      firstName:      u.firstName    || null,
      lastName:       u.lastName     || null,
      department:     u.department   || null,
      employeeId:     u.employeeId   || null,
      trainingStatus: u.completedAt  ? 'completed'
                    : (u.currentSlide > 0) ? 'in_progress'
                    : 'not_started',
      completedAt:    u.completedAt  ? new Date(u.completedAt).toISOString()  : null,
      completionDate: u.completedAt  ? new Date(u.completedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : null,
      quizScore:      u.quizScore    || null,
      xp:             u.xp           || 0,
      level:          u.level        || 1,
      currentSlide:   u.currentSlide || 0,
      labCredits:     u.labCredits   || 0,
      dueDate:        u.dueDate      ? new Date(u.dueDate).toISOString() : null,
      lastLogin:      u.lastLogin    ? new Date(u.lastLogin).toISOString() : null
    }));

    // ── Filters ─────────────────────────────────────────────────────────────────
    const { email, department, status } = req.query;
    if (email)      results = results.filter(u => (u.email||'').toLowerCase() === email.toLowerCase());
    if (department) results = results.filter(u => (u.department||'').toLowerCase().includes(department.toLowerCase()));
    if (status)     results = results.filter(u => u.trainingStatus === status);

    return res.status(200).json({
      ok: true,
      count: results.length,
      orgId,
      generatedAt: new Date().toISOString(),
      results
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
