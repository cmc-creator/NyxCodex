# Firebase Setup Guide for Destiny Springs Healthcare

## 🔧 Why Firebase?

Your training platform now includes:
- ✅ **User Authentication** - Staff login/signup with email
- ✅ **Cloud Data Storage** - Progress syncs across devices
- ✅ **Admin Dashboard** - See all staff performance in real-time
- ✅ **Zero Server Management** - Firebase handles scaling
- ✅ **Free Tier** - Up to 100 concurrent users at no cost

### Pricing
- **Free Tier**: Perfect for facilities <100 staff
- **Paid (if needed)**: ~$5-25/month for larger deployments

---

## 📋 Step 1: Create Firebase Project

### Create Google Cloud Project
1. Go to https://console.firebase.google.com/
2. Click **"Add Project"**
3. Name: `Destiny Springs Healthcare`
4. Accept terms, click **"Create Project"**
5. Wait 2-3 minutes for setup...

### Enable Authentication
1. In left sidebar, click **"Authentication"**
2. Click **"Get Started"**
3. Choose **"Email/Password"**
4. Toggle **"Enable"** ON
5. Save

### Create Realtime Database
1. In left sidebar, click **"Realtime Database"**
2. Click **"Create Database"**
3. Choose **"United States"** region (or your facility's region)
4. Start in **"Test Mode"** (change to secure rules later)
5. Click **"Create"**

---

## 🔑 Step 2: Get Your Firebase Config

### Find Your Credentials
1. In Firebase console, click **⚙️ Settings** (gear icon, top left)
2. Click **"Project Settings"**
3. Scroll to **"Your apps"** section
4. Click **"Web"** (</> icon)
5. Register app as `Destiny Springs Training Lab`
6. Copy the config object that appears

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD8UQAVR_GslkMyBSxjJEygHFcrbajr37c",
  authDomain: "destiny-springs-trainer.firebaseapp.com",
  databaseURL: "https://destiny-springs-trainer.firebasedatabase.app",
  projectId: "destiny-springs-trainer",
  storageBucket: "destiny-springs-trainer.appspot.com",
  messagingSenderId: "426519148291",
  appId: "1:426519148291:web:a1b2c3d4e5f6g7h8i9",
  measurementId: "G-XXXXXXXXXXXX"
};
```

---

## ⚙️ Step 3: Configure Firebase For This App

### Where The App Reads Config
This project now loads tenant settings from `tenant.config.js` first.

1. Open `tenant.config.js`
2. Keep `firebase: null` if you want to use the shared default Firebase project already referenced by the app
3. Or replace `firebase: null` with your own Firebase config object if you want a dedicated Firebase project for this tenant

Example:
```javascript
firebase: {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
}
```

### Tenant Org ID
Make sure this matches your database path prefix:
```javascript
orgId: 'destiny-springs'
```

All live data is stored under:
```text
orgs/{orgId}/...
```

4. Save the file

---

## 🔒 Step 4: Set Database Security Rules

### Protect Your Data
1. In Firebase Console, click **"Realtime Database"**
2. Click **"Rules"** tab at the top
3. Replace ALL rules with:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "orgs": {
      "$orgId": {
        ".read": "auth != null",
        ".write": false,
        "users": {
          "$uid": {
            ".read": "auth != null && (auth.uid === $uid || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')",
            ".write": "auth != null && (auth.uid === $uid || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')"
          },
          ".read": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')"
        },
        "admins": {
          ".read": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')",
          "$uid": {
            ".write": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || (!root.child('orgs').child($orgId).child('admins').exists() && auth.uid === $uid && auth.token.email != null))"
          }
        },
        "settings": {
          ".read": "auth != null",
          ".write": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')"
        },
        "audit": {
          ".read": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')",
          "$logId": {
            ".write": "auth != null"
          }
        },
        "invites": {
          ".read": "auth != null",
          ".write": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')"
        },
        "scenarios": {
          ".read": "auth != null",
          ".write": "auth != null && (root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'owner' || root.child('orgs').child($orgId).child('admins').child(auth.uid).child('role').val() === 'admin')"
        }
      }
    }
  }
}
```

4. Click **"Publish"**

### Seed The First Owner Account
You now have two supported options.

#### Option A: Auto-bootstrap on first login
This repo is configured to bootstrap the first owner from:

```text
ccooper@destinysprings.com
```

The email is configured in `tenant.config.js` under:

```javascript
bootstrapOwnerEmails: ['ccooper@destinysprings.com']
```

After you sign in with that account, the app will attempt to create:

```text
orgs/destiny-springs/admins/{YOUR_UID}
```

with role:

```json
{
  "role": "owner",
  "grantedAt": 1774911000000,
  "email": "ccooper@destinysprings.com",
  "name": "Connie Cooper",
  "bootstrap": true
}
```

#### Option B: Seed manually in the Firebase Data tab
1. Click **"Realtime Database"** → **"Data"** tab
2. Create path: `orgs/destiny-springs/admins/YOUR_UID`
3. Set value to:

```json
{
  "role": "owner",
  "grantedAt": 1774911000000,
  "email": "ccooper@destinysprings.com",
  "name": "Connie Cooper"
}
```

**How to get your UID:**
1. Go to **Authentication** in Firebase
2. Create test account with your email
3. Firebase generates a UID - copy it
4. Use that UID in the path above

---

## 🚀 Step 5: Deploy to GitHub Pages (Optional but Recommended)

If you want a live URL instead of file:// path:

### Setup GitHub Pages
1. Your repo: https://github.com/cmc-creator/NyxCodex
2. Go to **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**
5. Folder: **/ (root)**
6. Click **Save**

Your app is now at: `https://cmc-creator.github.io/NyxCodex/`

---

## 🧪 Step 6: Test Everything

### Test Login
1. Open `trainer_pro.html` in browser (or the GitHub Pages URL)
2. See login screen
3. Click **"Create Account"**
4. Enter: `test@destinysprings.local` / `TestPassword123!`
5. Should create account and log in ✅

### Test Data Saving
1. Complete a scenario (Slide 21)
2. Note XP increased
3. Refresh page
4. XP should still be there (saved to Firebase) ✅

### Test Admin Panel
1. After logging in, press **A** key
2. Should see Admin Dashboard
3. Click through tabs (Leaderboard, Users, Analytics)

---

## 👥 Adding Staff Accounts

### Method 1: Self-Registration (Recommended)
- Staff open trainer_pro.html
- Click "Create Account"
- Enter email + password
- Done! They can start training immediately

### Method 2: Batch CSV Import (Admin)
For importing 50+ staff at once:
1. Create CSV: `email, password, role`
2. Use Firebase Admin SDK script
3. (See tech team for this option)

---

## 🎓 User Profile Structure

When users train, Firebase stores:

```json
{
  "users": {
    "uid_xyz123": {
      "email": "john.smith@facility.local",
      "username": "John Smith",
      "xp": 1250,
      "level": 4,
      "scenariosCompleted": 12,
      "averageScore": "B",
      "scores": ["A", "B", "B", "C", "A"],
      "diagnoses": {
        "autism": {"completed": true, "score": "A"},
        "adhd": {"completed": true, "score": "B"}
      },
      "startDate": 1708182000000,
      "lastActive": 1708190400000,
      "role": "trainee"
    }
  },
  "leaderboard": {
    "all_users": [
      {"username": "John Smith", "xp": 1250, "level": 4},
      {"username": "Sarah Johnson", "xp": 1850, "level": 5}
    ]
  }
}
```

This allows Admin Dashboard to aggregate and display team performance!

---

## 🛡️ Security Best Practices

### DO:
✅ Use strong email passwords (change default Firebase rules)  
✅ Enable 2FA on your Firebase admin account  
✅ Keep API keys in environment variables for production  
✅ Regularly audit who has admin access  
✅ Backup Firebase data monthly  

### DON'T:
❌ Share your Firebase config publicly (it's already visible in code, but don't advertise it)  
❌ Put patient data in Firebase (training only!)  
❌ Leave database in "Test Mode" long-term  
❌ Give staff admin access  

---

## 🆘 Troubleshooting

### "Authentication domain mismatch"
- Check `authDomain` matches your Firebase project exactly
- Should be: `projectname.firebaseapp.com`

### "Permission denied" when saving data
- Check database rules (Step 4)
- Ensure user is authenticated before saving
- Verify user's UID matches database path

### "Cannot read property 'uid' of null"
- User not logged in
- Check login form is working
- Try creating new test account

### Quota exceeded (Free tier limits)
- Firebase allows 100 concurrent users free
- For 500+ staff, upgrade to paid plan (~$5-25/month)

---

## 📊 Admin Dashboard Features

Once Firebase is configured:

### Leaderboard Tab
- Real-time ranking of all staff by XP
- Filter by unit/department
- Download leaderboard as CSV

### Users Tab
- View each staff member's profile
- Reset users' progress if needed
- Ban/remove malicious users

### Analytics Tab
- Facility-wide completion rate
- Average response scores
- Time spent in training
- Diagnosis module popularity

### Reports Tab
- Generate compliance PDF
- Export for accreditation reviews
- Certificate batch generation

---

## 🔄 Maintenance Schedule

### Daily
- Monitor any error logs (Firebase Console)
- Check user signup/login functioning

### Weekly
- Review leaderboard for concerns
- Backup admin shouldn't need to do anything (Firebase auto-backs up)

### Monthly
- Audit admin user access
- Review analytics trends
- Generate compliance report

### Quarterly
- Test disaster recovery (restore from backup)
- Update security rules if needed
- Plan for next training cycle

---

## 📞 Support & Escalation

**Firebase Documentation**: https://firebase.google.com/docs
**Community Help**: https://stackoverflow.com/questions/tagged/firebase

If you need to:
- Scale beyond 500 users → Contact Firebase support (paid)
- Add 2FA/SSO for staff → Requires custom backend development
- Integrate with your hospital's authentication system → Contact IT/dev team

---

## 🎯 Next Steps

1. ✅ Create Firebase project (15 min)
2. ✅ Configure security rules (5 min)
3. ✅ Update trainer_pro.html config (5 min)
4. ✅ Test login/data save (10 min)
5. ✅ Add staff accounts (5 min)
6. ✅ Go live! 🚀

**Total Setup Time: ~45 minutes**

Once live, your staff can:
- Log in from any device
- See real-time leaderboard
- Admin tracks compliance
- All data automatically backed up

---

**Version**: 2.1  
**Last Updated**: February 17, 2026  
**Status**: Ready to Deploy
