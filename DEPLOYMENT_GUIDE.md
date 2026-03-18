# Hospital Training Lab - Deployment Guide

## Overview

You now have a **complete, enterprise-grade training platform** ready to deploy for Destiny Springs Healthcare. This guide walks you from "zero" to "live and production-ready" in approximately 60 minutes.

**What You're Getting:**
- 22+ interactive training slides covering de-escalation, diagnosis recognition, and crisis response
- User authentication system (staff sign up/login with email)
- Real-time data persistence (cloud-based, survives browser refreshes and device changes)
- Admin dashboard with leaderboard, user management, analytics, and reporting
- PDF certificate generation for completed training
- Desktop-first design optimized for computers/laptops, accessible on tablets and mobile devices
- Gamification (XP, levels, scores) to motivate staff engagement

**Architecture:**
- Frontend: HTML5/CSS/JavaScript (trainer_pro.html) - runs in browser
- Backend: Firebase (Google's serverless cloud platform) - handles auth + database
- Hosting: GitHub Pages (free, built into your existing GitHub repo)

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Google account (free at https://accounts.google.com)
- [ ] GitHub account (already have this - https://github.com/cmc-creator/Training-Lab.git)
- [ ] Text editor (VS Code recommended)
- [ ] CLI access or Git GUI (already configured on your machine)

---

## Step 1: Create Firebase Project (10 minutes)

### 1.1 Open Firebase Console
1. Visit https://console.firebase.google.com
2. Click **"Add project"** (blue button top-left)
3. Enter project name: `Destiny Springs Training Lab`
4. Check both checkboxes (analytics is optional but recommended)
5. Click **"Create project"** - wait for setup to complete (1-2 minutes)

### 1.2 Enable Authentication
1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Under "Sign-in method," select **"Email/Password"**
4. Toggle **both** switches ON (Email/Password and Password-less sign-in)
5. Click **"Save"**

### 1.3 Create Realtime Database
1. In left sidebar, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Select region: `us-central1` (or closest to your facility)
4. For rules, select **"Start in test mode"** (we'll apply security rules in Step 4)
5. Click **"Enable"** - wait 1 minute for database to initialize

### 1.4 Get Firebase Configuration
1. In top-left, click the **gear icon** → **"Project settings"**
2. Click **"Your apps"** tab (showing mobile/web icons)
3. Click **"< >"** (web app icon)
4. Enter app name: `Trainer Pro`
5. Check **"Also set up Firebase Hosting"** (optional, we'll use GitHub Pages)
6. Click **"Register app"**
7. On next screen, you'll see your Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

**SAVE THIS CONFIG** - you'll need it in Step 3.

Click **"Continue to console"** when done.

---

## Step 2: Create Admin User (5 minutes)

### 2.1 Register Your Admin Account
1. Open trainer_pro.html in your browser (double-click the file)
2. You'll see a **login screen** with "Sign Up" tab
3. Enter:
   - Email: `admin@destinysprings.local` (or your facility email)
   - Password: Something strong (12+ characters, mix of numbers/symbols)
4. Click **"Sign Up"** - wait 2-3 seconds for account creation

### 2.2 Get Your Admin UID
1. Go back to Firebase Console → **"Authentication"** tab
2. Click **"Users"** (top tab)
3. You'll see your email listed with a **UID** (long string like `abc123xyz...`)
4. **COPY THIS UID** - you'll need it in Step 4 for security rules

---

## Step 3: Configure trainer_pro.html (5 minutes)

### 3.1 Open trainer_pro.html in Text Editor
1. Right-click `trainer_pro.html` → **"Open with"** → **"VS Code"** (or your preferred editor)
2. Go to **line 17** - you'll see:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};
```

### 3.2 Replace Placeholders
1. Replace the "YOUR_*" values with the Firebase config you saved in Step 1.4
2. **DO NOT** share these values publicly (don't commit to GitHub publicly - this is private)
3. Example (with FAKE values for illustration):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD8UQAVR_GslkMyBSxjJEygHFcrbajr37c",
  authDomain: "destiny-springs-lab.firebaseapp.com",
  databaseURL: "https://destiny-springs-lab-default-rtdb.firebaseio.com",
  projectId: "destiny-springs-lab",
  storageBucket: "destiny-springs-lab.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### 3.3 Set Admin UID
1. Go to **line 29** - you'll see:

```javascript
const ADMIN_UID = "YOUR_ADMIN_UID_HERE";
```

2. Replace with the UID you copied in Step 2.2
3. **Ctrl+S** to save

---

## Step 4: Apply Firebase Security Rules (10 minutes)

### 4.1 Set Database Rules
1. Go to Firebase Console → **"Realtime Database"** → **"Rules"** tab
2. Replace ALL text with this:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid || auth.uid === 'YOUR_ADMIN_UID_HERE'",
        ".write": "auth.uid === $uid",
        "username": {
          ".validate": "newData.isString()"
        },
        "email": {
          ".validate": "newData.isString()"
        },
        "xp": {
          ".validate": "newData.isNumber()"
        },
        "level": {
          ".validate": "newData.isNumber()"
        },
        "averageScore": {
          ".validate": "newData.isNumber()"
        },
        "scores": {
          ".validate": "newData.isArray()"
        }
      }
    }
  }
}
```

3. Find and replace **`YOUR_ADMIN_UID_HERE`** with your actual admin UID from Step 2.2
4. Click **"Publish"** (blue button, top-right)
5. Confirm when prompted

### 4.2 Verify Rules Applied
1. Look for **green checkmark** next to "Rules" tab (indicates rules are valid)
2. You should see a confirmation message

---

## Step 5: Test Local Deployment (10 minutes)

### 5.1 Open trainer_pro.html
1. Double-click `trainer_pro.html` in File Explorer
2. Opens in your default browser
3. You should see **login screen** with "Sign Up" and "Sign In" tabs

### 5.2 Test Sign-Up Flow
1. Click **"Sign Up"**
2. Enter:
   - Email: `staff1@destinysprings.local`
   - Password: `TestPassword123!`
3. Click **"Sign Up"** - should redirect to tutorial slides

### 5.3 Test Data Persistence
1. Navigate through a few slides (use arrow keys or "Next" button)
2. Complete one of the diagnosis modules (click any slide)
3. **Close the browser tab** completely
4. Open `trainer_pro.html` again
5. It should:
   - Show login screen
   - Allow you to log in with same credentials
   - Restore your previous position and scores

### 5.4 Test Admin Dashboard
1. Log in as admin (use email from Step 2)
2. Press **"A"** on keyboard (or scroll to bottom, click "Admin Dashboard")
3. You should see 4 tabs:
   - **Leaderboard**: Shows staff rankings by XP
   - **Users**: Shows all registered staff
   - **Analytics**: Shows 4 KPI cards (Total Users, Avg Completion %, etc.)
   - **Reports**: Export CSV or generate PDF certificates

### 5.5 Test Certificate Generation
1. Click on any score entry or "Generate Certificate"
2. Should prompt to download PDF with your name and stats
3. Open PDF - verify it looks professional

**If any of the above failed**, see **Troubleshooting** section below.

---

## Step 6: Deploy to GitHub Pages (15 minutes)

### 6.1 Enable GitHub Pages
1. Visit https://github.com/cmc-creator/Training-Lab (your repo)
2. Click **"Settings"** tab (top-right)
3. In left sidebar, click **"Pages"**
4. Under "Source," select **"Deploy from a branch"**
5. Select branch: **"main"**
6. Select folder: **"/ (root)"**
7. Click **"Save"**

### 6.2 Wait for Deployment
1. GitHub Pages will build (takes 1-2 minutes)
2. You'll see a banner: "Your site is live at https://cmc-creator.github.io/Training-Lab/"
3. **COPY THIS URL** - this is your public training platform

### 6.3 Verify Live Deployment
1. Paste the URL into a browser (incognito window recommended for clean test)
2. Verify:
   - Login screen appears
   - Can sign up with new email
   - Can access slides
   - Data persists after refresh
   - Admin dashboard works (if admin user)

### 6.4 Update README with Live Link
1. Open `README.md` in editor
2. Add after "Quick Start" section:

```markdown
## 🚀 Live Platform

Staff can access the training platform here:
**[Destiny Springs Training Lab](https://cmc-creator.github.io/Training-Lab/)**

- Email: Use your facility email
- Password: Create secure password on first login
- Admin Access: Press "A" key if you're an administrator
```

3. Save and commit:
```
git add README.md
git commit -m "Docs: Add live platform URL"
git push origin main
```

---

## Step 7: Set Up Additional Admin Users (5 minutes per user)

### Option A: Add Individual Admin
1. Ask them to go to https://cmc-creator.github.io/Training-Lab/
2. Sign up with their facility email
3. Get their UID from Firebase Console → Authentication → Users
4. Update `ADMIN_UID` in trainer_pro.html to include them:

**Before:**
```javascript
const ADMIN_UID = "abc123xyz...";
```

**After (multiple admins):**
```javascript
const ADMIN_UIDS = ["abc123xyz...", "def456uvw..."];
// Then update the admin check on line ~210 from:
// if (auth.uid === ADMIN_UID)
// To:
// if (ADMIN_UIDS.includes(auth.uid))
```

**Then commit and push** to update all users.

### Option B: Batch Admin Setup
1. Create list of admin emails internally
2. Have them sign up first (get their UIDs)
3. Update ADMIN_UID in trainer_pro.html with all of them at once
4. Commit and push once

---

## Maintenance & Operations

### Monthly Tasks
- **Review Leaderboard**: Check user engagement (Analytics tab)
- **Export Reports**: Use Reports tab to generate compliance PDFs
- **Reset Progress**: Use Users tab to reset staff progress if needed

### Backup User Data
1. Go to Firebase Console → Realtime Database
2. Click **"⋮"** (three dots) → **"Export JSON"**
3. Save locally each month

### Monitor Database Usage
1. Firebase Console → **"Usage"** tab
2. Check Realtime Database read/write operations
3. Free tier allows 100 connections, 1GB storage - more than enough for 50-100 staff

### Update Training Content
1. New diagnosis modules? Edit trainer_pro.html and add slides
2. New scenarios? Integrate with Gemini API (see FIREBASE_SETUP.md Advanced section)
3. Commit changes and push - all users get updates automatically

---

## Troubleshooting

### Login Not Working
**Symptom**: "Cannot sign up" or "Error: auth/invalid-email"

**Solution**:
1. Verify Firebase Authentication is enabled (Console → Authentication → Sign-in methods)
2. Check that firebaseConfig values are correct (copy again from Firebase Console)
3. **Clear browser cache**: Ctrl+Shift+Delete, clear all data
4. Try incognito window

### "Permission Denied" Error
**Symptom**: Login works but slides show blank, scores don't save

**Solution**:
1. Verify Realtime Database rules are published (should have green checkmark)
2. Ensure `databaseURL` in firebaseConfig is correct
3. Check that security rules include your UID for reads/writes
4. Wait 30 seconds after publishing rules (Firebase propagation delay)

### Admin Dashboard Not Showing
**Symptom**: Press "A" but nothing happens

**Solution**:
1. Verify your UID matches `ADMIN_UID` in trainer_pro.html
2. Get your actual UID from Firebase Console → Authentication → Users
3. Update ADMIN_UID in trainer_pro.html (line 29)
4. Save, refresh browser

### Data Not Persisting
**Symptom**: You log in, do training, close tab, reopen and scores are gone

**Solution**:
1. Check browser console (F12 → Console tab) for errors
2. Verify that Realtime Database rules allow writes (security rules step)
3. Ensure user is actually authenticated (check "Users" in Firebase Console)
4. Clear browser cache and try again

### GitHub Pages Showing Old Version
**Symptom**: You updated trainer_pro.html but website shows old version

**Solution**:
1. Force refresh in browser: **Ctrl+Shift+R** (hard refresh)
2. Clear browser cache: Ctrl+Shift+Delete
3. Check GitHub repo → Settings → Pages that deployment completed (green checkmark)
4. GitHub deploys happen within 1-2 minutes

### Staff Accessing from Mobile Devices
**Note**: The platform uses a desktop-first design optimized for desktop/laptop computers.

**Mobile Access**:
1. Platform is accessible on mobile devices but displays the desktop layout
2. Mobile users can pinch-to-zoom and scroll to navigate
3. For best experience, recommend tablets (10"+ screens) or desktop computers
4. If mobile access is critical, users should use landscape orientation and zoom as needed

**Troubleshooting Mobile Access**:
- Try different mobile browser (Chrome, Safari, Firefox)
- Check phone internet connection
- Clear browser cache and try again
- Use landscape orientation for better viewing
- Enable "Request Desktop Site" in browser settings if needed

---

## Security Considerations

### ⚠️ IMPORTANT: Protect Your Firebase Credentials

Your Firebase config contains sensitive information. Here's how to keep it secure:

1. **Never share `trainer_pro.html`** publicly - it contains your API key
2. **Don't commit to public GitHub** - add to .gitignore if using version control privately
3. **Restrict Firebase Console access** - use strong passwords, enable 2FA
4. **Review Firebase rules** - ensure only allowed actions are permitted
5. **Monitor database usage** - free tier limits protect you from unexpected bills

### If Credentials Are Compromised
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **"Regenerate key"**
3. Get new config and update trainer_pro.html
4. Push and redeploy

---

## Next Steps & Enhancements

### Short Term (Ready Now)
- [x] Firebase setup
- [x] Staff registration and login
- [x] Training access
- [x] Data persistence

### Medium Term (Recommended Soon)
- [ ] Add Gemini API integration for dynamic scenarios (30 min - see FIREBASE_SETUP.md)
- [ ] Complete remaining diagnosis modules (Schizophrenia, Bipolar, PTSD, BPD) - 2-3 hours
- [ ] Add email notifications for admin alerts
- [ ] Create facility-specific scenario library

### Long Term (Future Enhancements)
- [ ] Mobile app (using existing Firebase backend)
- [ ] Video scenarios with AI chatbot
- [ ] Multilingual support
- [ ] Offline mode with sync
- [ ] Integration with facility LMS/HR system

---

## Quick Reference

| Task | Time | Difficulty |
|------|------|-----------|
| Create Firebase Project | 10 min | Easy |
| Configure trainer_pro.html | 5 min | Easy |
| Apply Security Rules | 10 min | Easy |
| Test Locally | 10 min | Easy |
| Deploy to GitHub Pages | 15 min | Easy |
| **Total** | **~60 min** | **Easy** |

---

## Support & Documentation

- **FIREBASE_SETUP.md** - Detailed Firebase configuration reference
- **ADMIN_MANUAL.md** - Admin-specific operations guide
- **DATA_ARCHITECTURE.md** - Technical data structure reference
- **QUICK_START.md** - Quick reference for staff training
- **README.md** - Project overview

---

## Contact & Questions

For issues or questions:
1. Check the Troubleshooting section above
2. Review relevant .md files in the repo
3. Check Firebase Console auth/database logs for errors
4. Contact your IT support team

---

**Last Updated**: 2024  
**Platform**: Destiny Springs Healthcare Training Lab  
**Version**: Enterprise 1.0 (Firebase Backend)
