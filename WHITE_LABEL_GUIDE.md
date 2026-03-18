# De-escalation Mastery Lab™ — White Label Onboarding Guide

**For:** Destiny Springs Healthcare (Platform Owner)  
**Purpose:** Step-by-step guide to deploying a new branded instance for a client facility  
**Time to deploy:** ~30–45 minutes for a new client  

---

## Overview

Each client gets their own **independent deployment** — their own URL, their own branding, their own data. No client can see another client's staff data. The same codebase powers all of them; only `tenant.config.js` and a few image files change per client.

---

## What You Need From the Client Before Starting

Collect the following before you begin:

| Item | Example | Notes |
|---|---|---|
| Organization full name | Valley Hope Behavioral Health | Used on login page, certificate, hub |
| Short org ID | `valley-hope` | Lowercase, no spaces, URL-safe |
| Website URL | https://valleyhope.org | Shown on login page footer |
| Mailing address | 1 Recovery Blvd, Phoenix AZ | Shown on login page footer |
| Logo file | `logo.png` | PNG or SVG, transparent background, ~400×150px ideal |
| Background image | `lab.png` | JPG or PNG, used behind hub option cards |
| Brand primary color | `#1a5276` | Deep/dark color for borders and cert accents |
| Brand accent color | `#7D3C98` | Used for XP badges and gradient highlights |
| Brand button color | `#2E86C1` | Buttons, links, focus rings |
| Scenario patient name | Marcus | Name of the practice patient in the Lab |
| Patient diagnosis | Combat PTSD, evaluation pending | Shown in the Lab sidebar |
| Admin email(s) | jane@valleyhope.org | Will be granted admin role in Firebase |

---

## Step 1 — Fork the Repository

1. Go to: **https://github.com/cmc-creator/Training-Lab**
2. Click **Fork** (top right)
3. On the fork screen:
   - Repository name: use the client's org ID, e.g. `valley-hope-training-lab`
   - Description: `De-escalation Mastery Lab — Valley Hope Behavioral Health`
   - Make it **Private** (client data protection)
4. Click **Create fork**

> You now have a clean copy of the platform in your GitHub account, completely independent from the master repo.

---

## Step 2 — Clone to Your Computer

Open a terminal (PowerShell or Command Prompt):

```powershell
git clone https://github.com/YOUR-GITHUB-USERNAME/valley-hope-training-lab.git
cd valley-hope-training-lab
```

---

## Step 3 — Edit `tenant.config.js`

This is the **only file** that defines who the client is. Open it in VS Code or any text editor.

Replace every value with the client's information:

```js
window.TENANT = {

  // ── Identity ──────────────────────────────────────────
  orgId:         'valley-hope',                       // ← client's short ID
  orgName:       'Valley Hope Behavioral Health',     // ← full org name
  orgWebsite:    'https://valleyhope.org/',           // ← their website
  orgAddress:    '1 Recovery Blvd, Phoenix AZ 85001', // ← mailing address

  brandName:     'De-escalation Mastery Lab™',        // ← keep unless client wants custom name
  moduleCount:   27,
  tagline:       '27-Module Inpatient Psychiatric Crisis Intervention Training',
  subtopics:     'CPI Model · Diagnosis-Specific Care · Trauma-Informed Practice · Safety Protocols',
  copyrightYear: '2026',

  // ── Assets ────────────────────────────────────────────
  logoUrl:       'logo.png',    // ← must match the filename you upload in Step 4
  labImageUrl:   'lab.png',     // ← must match the filename you upload in Step 4

  // ── Brand Colors ──────────────────────────────────────
  colorPrimary:  '#1a5276',     // ← deep brand color
  colorAccent:   '#7D3C98',     // ← accent / highlight color
  colorButton:   '#2E86C1',     // ← button / link color
  colorBg:       '#0f172a',     // ← page background (usually leave as-is)

  // ── Scenario Patient ──────────────────────────────────
  patientName:   'Marcus',      // ← practice patient name
  patientDx:     'Combat PTSD, evaluation pending', // ← patient diagnosis

  // ── Voice (ElevenLabs) ────────────────────────────────
  voiceId:       'NFG5qt843uXKj4pFvR7C', // ← informational only; actual voice set in Vercel

  // ── Firebase Override ─────────────────────────────────
  firebase: null, // ← leave null to use shared Firebase (data isolated under orgs/valley-hope/)

};
```

**Save the file when done.**

---

## Step 4 — Drop In the Client's Images

Replace these two files in the repo folder:

| Filename | What it is | Requirements |
|---|---|---|
| `logo.png` | Client's organization logo | PNG preferred, transparent background, min 400px wide |
| `lab.png` | Background image for hub cards | JPG or PNG, landscape, min 1200×800px |

> **Important:** The filenames must exactly match what you put in `logoUrl` and `labImageUrl` in `tenant.config.js`. If the client sends `their-logo.png`, either rename it to `logo.png` or update the config to say `logoUrl: 'their-logo.png'`.

---

## Step 5 — Set Up a Dedicated Firebase (Optional but Recommended for Larger Clients)

For small pilots, the shared Firebase is fine (data isolated under `orgs/{orgId}/`).  
For enterprise clients who require data sovereignty, create a dedicated Firebase:

1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it e.g. `valley-hope-training`
3. Enable **Realtime Database** → Start in locked mode
4. Enable **Authentication** → Turn on: Email/Password, Google
5. Go to **Project Settings → General → Your apps → Add app → Web**
6. Copy the Firebase config object and paste it into `tenant.config.js`:

```js
  firebase: {
    apiKey: "AIza...",
    authDomain: "valley-hope-training.firebaseapp.com",
    databaseURL: "https://valley-hope-training-default-rtdb.firebaseio.com",
    projectId: "valley-hope-training",
    storageBucket: "valley-hope-training.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  },
```

7. Set Firebase **Realtime Database Rules** (paste this exactly):

```json
{
  "rules": {
    "orgs": {
      "$orgId": {
        "users": {
          "$uid": {
            ".read": "auth != null && (auth.uid == $uid || root.child('orgs/' + $orgId + '/admins/' + auth.uid).exists())",
            ".write": "auth != null && (auth.uid == $uid || root.child('orgs/' + $orgId + '/admins/' + auth.uid).exists())"
          }
        },
        "admins": {
          ".read": "auth != null && root.child('orgs/' + $orgId + '/admins/' + auth.uid).exists()",
          ".write": "auth != null && root.child('orgs/' + $orgId + '/admins/' + auth.uid).exists()"
        },
        "settings": {
          ".read": "auth != null",
          ".write": "auth != null && root.child('orgs/' + $orgId + '/admins/' + auth.uid).exists()"
        }
      }
    }
  }
}
```

---

## Step 6 — Connect to Vercel

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. Select the forked repo (e.g. `valley-hope-training-lab`)
4. Framework preset: **Other**
5. Root directory: leave as `/`
6. Click **Deploy**

Vercel will deploy in ~60 seconds.

---

## Step 7 — Set Environment Variables in Vercel

After the first deploy, go to:  
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Variable Name | Value | Notes |
|---|---|---|
| `ELEVENLABS_API_KEY` | `sk_...` | Your ElevenLabs API key |
| `ELEVENLABS_VOICE_ID` | `NFG5qt843uXKj4pFvR7C` | Prof. Vance voice ID (or a custom clone for this client) |

Click **Save** after adding each variable, then go to **Deployments → Redeploy** to apply them.

---

## Step 8 — Set a Custom Domain (Optional)

In **Vercel → Your Project → Settings → Domains**:

1. Click **Add Domain**
2. Enter e.g. `training.valleyhope.org`
3. Follow Vercel's DNS instructions (usually a CNAME record at the client's domain registrar)
4. Vercel auto-provisions an SSL certificate — usually live within 5 minutes

---

## Step 9 — Push and Go Live

Back in your local terminal:

```powershell
git add .
git commit -m "init: Valley Hope Behavioral Health white label config"
git push
```

Vercel automatically deploys on every push to `main`. The site is live.

---

## Step 10 — Grant Admin Access to the Client

1. Have the client admin **create an account** at their deployment URL first
2. Go to **https://console.firebase.google.com → Realtime Database**
3. Navigate to: `orgs/valley-hope/admins/`
4. Click the **+** button and add their Firebase UID:
   - Key: their Firebase User UID (found in **Authentication → Users**)
   - Value: `{ "role": "admin", "grantedAt": [current timestamp] }`

> **Tip:** Once you grant yourself owner access, you can grant admin roles to others directly from the in-app Command Center (press `A` on keyboard) without going into Firebase Console.

---

## Step 11 — Smoke Test Before Handing Off

Run through this checklist before giving the URL to the client:

- [ ] Login page shows client's logo and org name
- [ ] Sign up with a test account using client's domain email
- [ ] Hub screen shows correct org name in heading and pill tag
- [ ] Navigate through 3–4 training slides — content loads, layout looks good
- [ ] Prof. Vance speaks on slide 0 and new slide visits (check browser console for TTS errors)
- [ ] Enter the Lab — patient name and diagnosis show correctly in sidebar
- [ ] Download the certificate — verify org name, brand name, and filename are correct
- [ ] Admin dashboard — press `A`, verify Command Center shows the correct org name
- [ ] Mobile — view on a phone browser, confirm layout is responsive

---

## Pricing / Billing Considerations

When packaging this for sale, consider these models:

| Model | How it works | Suggested starting price |
|---|---|---|
| **Per seat / year** | Charge per active staff user per year | $25–$50/user/year |
| **Flat facility fee** | One annual price per facility regardless of user count | $2,000–$5,000/year |
| **Setup + subscription** | One-time setup fee + monthly/annual SaaS | $500 setup + $200/month |
| **Enterprise** | Dedicated Firebase, custom domain, SSO, priority support | Custom quote |

ElevenLabs TTS costs roughly $0.30 per 1,000 characters. A full run-through of all 27 slides generates approximately 3,000–5,000 characters per user. Factor this into pricing.

---

## File Checklist for Each New Deployment

```
valley-hope-training-lab/
├── tenant.config.js      ← EDITED for this client
├── logo.png              ← REPLACED with client logo
├── lab.png               ← REPLACED with client background image
├── trainer_pro.html      ← NEVER edit (shared platform code)
├── api/
│   ├── tts.js            ← NEVER edit
│   └── pax-chat.js       ← NEVER edit
└── vercel.json           ← NEVER edit
```

**The golden rule: only `tenant.config.js` and the image files change. Everything else is identical across all deployments.**

---

## Troubleshooting Common Issues

**Logo not showing**  
→ Check that `logoUrl` in config matches the exact filename (case-sensitive on Linux servers)  
→ Verify the image is in the root folder, not a subfolder  

**Vance not speaking**  
→ Check Vercel environment variables are set  
→ Check browser console for `/api/tts` errors  
→ Verify ElevenLabs account has remaining character credits  

**Data not saving**  
→ Check Firebase Realtime Database rules are published (not in draft)  
→ Confirm the `orgId` in `tenant.config.js` is lowercase, no spaces  
→ Check browser console for Firebase permission errors  

**Wrong org name showing somewhere**  
→ Run browser DevTools → Console and check `window.TENANT` — it should show the full config object  
→ If it's undefined, `tenant.config.js` is not loading — check the script tag in `trainer_pro.html` line 10  

**Certificate has wrong filename or branding**  
→ `orgId` is used for the PDF filename — confirm it is set in config  
→ Hard refresh the browser (Ctrl+Shift+R) to clear any cached JS  

---

*Document maintained by Destiny Springs Healthcare · De-escalation Mastery Lab™ Platform Team*  
*Last updated: February 2026*
