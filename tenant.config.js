// ─────────────────────────────────────────────────────────────────────────────
// TENANT CONFIGURATION — NyxCodex™ by Nyx Collective LLC
// ─────────────────────────────────────────────────────────────────────────────
// To white-label this platform for a new organization:
//   1. Copy this file into the new deployment folder
//   2. Edit every value below for the new org
//   3. Replace logoUrl and labImageUrl with the org's own assets
//   4. Optionally point TENANT.firebase to a dedicated Firebase project
//      (or leave null to use the shared multi-tenant Firebase under orgs/{orgId}/)
//   5. Set ELEVENLABS_VOICE_ID in Vercel env vars for the org's voice
// ─────────────────────────────────────────────────────────────────────────────

window.TENANT = {

  // ── Identity ──────────────────────────────────────────────────────────────
  // orgId MUST be lowercase, URL-safe, no spaces (used as Firebase path prefix)
  orgId:         'destiny-springs',
  orgName:       'NyxCodex\u2122',
  orgWebsite:    'https://nyxcodex.com/',
  orgAddress:    '',

  brandName:     'NyxCodex\u2122',
  productLine:   'NyxCodex\u2122 \u2014 A Nyx Collective LLC Platform',
  moduleCount:   31,
  tagline:       'De-escalation &amp; Crisis Intervention Training \u2014 NyxCodex\u2122 Training Lab',
  subtopics:     'CPI Model \u00B7 Diagnosis-Specific Care \u00B7 Trauma-Informed Practice \u00B7 Safety Protocols',

  // ── Certification & Compliance ────────────────────────────────────────────────────────────────────────────────────────
  // Displayed on the certificate and compliance reports. Update per org as needed.
  certContactHours:    4.0,
  certType:            'Internal Competency Verification',
  certProvider:        'NyxCodex\u2122 \u2014 Nyx Collective LLC',
  certRenewalMonths:   12,
  trainingAdminName:   'Training & Education Department',
  certCompetencyDomains: [
    'De-escalation & Crisis Communication',
    'Trauma-Informed Care',
    'Diagnosis-Specific Behavioral Interventions',
    'Safety & Restraint Prevention',
    'Cultural Humility & Person-Centered Care',
    'Mandated Reporting & Documentation',
  ],

  copyrightYear: '2026',
  copyrightHolder: 'Nyx Collective LLC',

  // ── Assets ────────────────────────────────────────────────────────────────
  // Relative or absolute URLs. Replace with CDN links for hosted tenants.
  logoUrl:       'nyxcodex-logo.png',   // shown on login, hub, and certificate
  labImageUrl:   'lab.png',   // background image for hub option cards

  // ── Brand Colors ──────────────────────────────────────────────────────────
  // Injected as CSS custom properties on :root — override any of these
  colorPrimary:  '#1e3a8a',   // deep navy  (borders, cert accent bars)
  colorAccent:   '#7c3aed',   // purple     (XP badges, gradient end)
  colorButton:   '#2563eb',   // blue       (buttons, links, focus rings)
  colorBg:       '#0f172a',   // dark navy  (page background)

  // ── Scenario Patient ──────────────────────────────────────────────────────
  // The name and diagnosis that appear in the live Lab and Vance's coaching.
  patientName:   'Marcus',
  patientDx:     'Combat PTSD, evaluation pending',

  // ── Voice (ElevenLabs) ────────────────────────────────────────────────────
  // Set ELEVENLABS_VOICE_ID and ELEVENLABS_API_KEY as Vercel environment
  // variables. The voiceId here is informational only; the API reads from env.
  voiceId:       'NFG5qt843uXKj4pFvR7C',  // Professor Vance (custom clone)

  // ── Firebase Override (optional) ──────────────────────────────────────────
  // Leave null to share the default Firebase project (data isolated under
  // orgs/{orgId}/ automatically). Set to a Firebase config object to give
  // this org a completely dedicated Firebase project.
  firebase: null,

  // ── Admin Bootstrap (optional) ────────────────────────────────────────────
  // Any email listed here can self-seed as the first owner account when no
  // admin records exist yet for this tenant.
  bootstrapOwnerEmails: ['ccooper@destinysprings.com'],

};

// ── Inject CSS Custom Properties immediately ───────────────────────────────
// Runs synchronously so every stylesheet and inline style that references
// var(--brand-*) resolves correctly from the first paint.
(function applyTenantTheme() {
  const t = window.TENANT;
  const style = document.createElement('style');
  style.id = 'tenant-theme';
  style.textContent = [
    ':root {',
    `  --brand-primary: ${t.colorPrimary};`,
    `  --brand-accent:  ${t.colorAccent};`,
    `  --brand-button:  ${t.colorButton};`,
    `  --brand-bg:      ${t.colorBg};`,
    '}',
  ].join('\n');
  document.head.appendChild(style);
}());
