# Data Architecture & Usage Guide

## How Data is Retained

Your Destiny Springs Healthcare training platform uses a **hybrid browser-based persistence system** that requires no server setup.

### 1. **Browser Local Storage** (Primary)
Data is automatically saved to each browser's local storage:
```
localStorage[`trainee_${userName}`] = {
  userName: "John_Smith",
  xp: 1500,
  scenariosCompleted: 12,
  scores: ["A", "B", "A", "C", "B", ...],
  timestamp: "2026-02-17T15:30:00Z",
  completedSlides: 8
}
```

**Capacity**: ~5-10MB per domain  
**Persistence**: Data survives browser restart, cleared only on manual deletion or browser cache clear  
**Security**: Browser-sandboxed (isolated per domain/user)

### 2. **Team-Level Data Management**
Since local storage is per-browser, your facility needs a way to aggregate staff progress:

#### **Option A: Export/Import (Built-In)**
- Each employee trains on their own computer
- Admin uses **Admin Dashboard** → **Data Manager** → **Export as JSON**
- This creates a backup file with all staff progress
- Admin can import multiple export files to aggregate team data

#### **Option B: Shared Computer Training** (Multiple Users)
- Each trainee logs in with a unique username
- Each user's data stored under `trainee_${username}`
- Admin dashboard automatically shows all users' data on that computer
- Use leaderboard to track performance

#### **Option C: Cloud Integration** (Advanced - Optional)
- For organization-wide tracking, you can add Firebase/Supabase
- Currently built for local-first approach to avoid infrastructure costs

---

## Admin Dashboard (Press 'A' or Click Button)

### **Leaderboard Tab** 🏆
- Displays all trainees ranked by XP
- Shows scenarios completed and average score
- Real-time ranking updated as people complete training

### **Data Manager Tab** 💾
**Export Process:**
1. Click "Export as JSON"
2. File downloads: `training-lab-export-2026-02-17.json`
3. Contains all employee data with timestamps
4. Store in secure folder as backup

**Import Process:**
1. Upload previously exported JSON file
2. Merges data without overwriting existing records
3. Useful for combining data from multiple computers

**Clear Data:**
- Permanently removes all training records from this computer
- ⚠️ Create a backup first!

### **Settings Tab** ⚙️
- Edit facility name (appears on certificates)
- Edit your trainer name (for multi-trainer setup)
- View statistics (total scenarios, # of trainees, avg XP)

---

## Data Flow Diagram

```
Trainee Opens trainer.html
         ↓
    Loads from localStorage
         ↓
   Enters API Key & Starts Training
         ↓
   Completes Scenario/Debrief/Script
         ↓
   Score & XP calculated, saved to localStorage
         ↓
   On Demand: Admin Exports → JSON Backup
         ↓
   Admin Imports to aggregate multiple users
         ↓
   Team Leaderboard & Analytics Ready
```

---

## Data Retention Timeline

| Action | Data Life |
|--------|-----------|
| User completes scenario | Saved instantly to localStorage |
| Browser tab closed | Data persists ✅ |
| Browser closed completely | Data persists ✅ |
| Computer restarted | Data persists ✅ |
| Browser cache cleared | ⚠️ Data lost (restore from backup) |
| Browser uninstalled | Data lost (restore from backup) |
| Export created | Backup file created |
| Import from backup | Data restored |

---

## Recommended Workflow for Facilities

### **Week 1: Setup**
1. Host `trainer.html` on a shared server or send to all employees
2. Each employee opens in their browser
3. They complete any required API key setup
4. Training begins!

### **Ongoing: Weekly Tracking**
1. Each Friday, Admin opens Admin Dashboard (press 'A')
2. Screenshots/exports the leaderboard
3. Tracks progress for performance reviews
4. Monthly export as backup

### **Monthly: Data Aggregation**
1. Admin collects JSON exports from each computer/department
2. Imports them all into one "master" computer
3. Generates comprehensive facility-wide leaderboard
4. Stores exports in secure folder structure:
```
Training Lab Backups/
├── 2026-02-17-export-North-Unit.json
├── 2026-02-17-export-South-Unit.json
├── 2026-02-17-export-Admin.json
└── README.txt (dates, # of trainees per unit)
```

### **Year-End: Compliance Reporting**
1. Pull final exports with completion dates
2. Use XP scores as evidence of training completion
3. Certificates available on demand (click download button)
4. Archive all exports with training certifications

---

## Security Considerations

### **What's Protected**
✅ API key never stored locally (re-entered each session)  
✅ Each browser's localStorage is sandboxed  
✅ Export files are JSON (can be encrypted with 7-Zip)  
✅ No data sent to external servers except Gemini API (which only sees scenario/response text)

### **What to Be Aware Of**
⚠️ Shared computers = all users' data visible to each other  
⚠️ Clearing browser cache = data loss (unless backed up)  
⚠️ Export files contain sensitive training data  
⚠️ API key should not be hardcoded (users enter manually)

### **Best Practices**
- Store export files in secure, password-protected folders
- Create monthly backups in duplicate locations
- Don't share trainer.html with API key pre-filled
- Use unique usernames to distinguish trainees
- Review exported data before sharing externally

---

## Troubleshooting Data Issues

**"Data not saving"**
- Check browser allows localStorage (Privacy mode blocks it)
- Verify not in Incognito/Private browsing
- Clear browser cache to reset

**"Lost my progress"**
- Restore from backup export if available
- Data only recoverable if you created an export beforehand
- Prevention: Set monthly export reminders

**"Can't see other trainees' data"**
- They must train on the same computer
- Or use Admin Dashboard → Data Manager → Import their export file
- Each device has separate localStorage

**"Leaderboard shows duplicates"**
- Imported same export twice
- Clear data and re-import once, OR
- Use a backup computer to avoid mixing data

**"Export file won't import"**
- Verify file is valid JSON (not corrupted)
- Try opening in text editor to check format
- JSON format should be: `{ "trainee_username": { ...data... }, ... }`

---

## Database Schema (For Reference)

```json
{
  "trainee_John_Smith": {
    "userName": "John_Smith",
    "xp": 1500,
    "scenariosCompleted": 12,
    "scores": ["A", "B", "A", "B", "C"],
    "timestamp": "2026-02-17T15:30:00Z",
    "completedSlides": 8
  },
  "trainee_Sarah_Johnson": {
    "userName": "Sarah_Johnson",
    "xp": 2100,
    "scenariosCompleted": 18,
    "scores": ["A", "A", "B", "A", "A"],
    "timestamp": "2026-02-17T14:15:00Z",
    "completedSlides": 11
  },
  "lastTrainee": "John_Smith"
}
```

---

## Future Enhancements

If you want to upgrade to a true multi-user system:

### **Option 1: Google Firebase (Free tier available)**
- Real-time cloud sync
- Multi-device synchronization
- Advanced analytics
- Cost: Free up to 1GB/month

### **Option 2: Supabase (PostgreSQL Backend)**
- Open-source Firebase alternative
- Better for compliance/HIPAA requirements
- Can self-host
- Cost: $25-150/month depending on usage

### **Option 3: Simple Node.js Server**
- Run locally on facility network
- Express.js + SQLite database
- No cloud dependencies
- Cost: One-time setup, 0 monthly

---

## Support & Questions

For issues or enhancement requests:
- Check GitHub issues: https://github.com/cmc-creator/NyxCodex/
- Create a new issue with details
- Include exported data sample (with sensitive names removed)

---

**Version**: 2.0  
**Last Updated**: February 2026  
**Created for**: Destiny Springs Healthcare Psychiatric Acute Care

---

## Firebase Realtime Database Schema

### Subscription Record
Path: `orgs/{orgId}/subscription`

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `active` \| `inactive` \| `canceled` \| `past_due` |
| `plan` | string | `small` \| `medium` \| `enterprise` |
| `seatsMax` | number | Max users: 25 (small), 100 (medium), -1 unlimited (enterprise) |
| `stripeCustomerId` | string | Stripe Customer ID (e.g. `cus_xxx`) |
| `stripeSubscriptionId` | string | Stripe Subscription ID (e.g. `sub_xxx`) |
| `currentPeriodEnd` | number | Unix timestamp when current billing period ends |
| `orgName` | string | Human-readable org name |
| `adminEmail` | string | Primary admin email |
| `activatedAt` | number | Unix timestamp when subscription was activated |

### User Record
Path: `orgs/{orgId}/users/{uid}`

All user training data scoped under their org. The `_ref()` helper in trainer_pro.html
automatically prefixes all reads/writes with `orgs/{orgId}/`.

### Seat Enforcement
- On signup, user count at `orgs/{orgId}/users/` is compared to `seatsMax`
- Enterprise orgs (`seatsMax === -1`) have no limit
- New signups over the limit are rejected with an error message

### Subscription Check Flow
1. User logs in via Firebase Auth
2. `checkSubscriptionThenLoad()` reads `orgs/{orgId}/subscription`
3. If `status !== 'active'` or `currentPeriodEnd` is past: paywall screen shown
4. Exception: `orgId === 'destiny-springs'` is always allowed (owner org)
5. Network errors fail open (users not locked out on connectivity issues)

### Stripe Webhook Events
- `checkout.session.completed` -> creates/activates subscription record
- `customer.subscription.updated` -> updates plan/status
- `customer.subscription.deleted` -> sets status to `canceled`
- `invoice.payment_failed` -> sets status to `past_due`
