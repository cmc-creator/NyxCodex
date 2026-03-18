# Admin Setup & Operations Manual

## 🎯 Overview
Your Destiny Springs Healthcare De-escalation Training Lab is now fully operational with:
- ✅ Interactive AI-powered training modules
- ✅ 8 diagnosis-specific guides (Autism, ADHD, Schizophrenia, Bipolar, PTSD, Depression, Anxiety, BPD)
- ✅ Real-time scoring & feedback
- ✅ Automatic data persistence (browser localStorage)
- ✅ Team leaderboard tracking
- ✅ PDF certificate generation
- ✅ Admin dashboard with data management
- ✅ Full Git version control & GitHub backup

---

## 📍 Repository Location
**GitHub**: https://github.com/cmc-creator/Training-Lab  
**Local Path**: `\\192.168.168.182\Folder Redirection\Ccooper\Documents\Training Lab\`

---

## 🚀 Deployment Options

### **Option 1: Direct File (Recommended for Most Facilities)**
1. Copy `trainer.html` to shared drive or email to staff
2. Staff opens in any browser
3. No server needed
4. **Best for**: Small to medium groups

### **Option 2: Web Hosting**
1. Upload `trainer.html` to web server (any host)
2. Make accessible via URL: `https://yourfacility.com/trainer.html`
3. Staff access via web browser
4. **Best for**: Remote staff, multiple locations

### **Option 3: Internal Network Server**
1. Place `trainer.html` on facility intranet server
2. Create shortcut on staff computers
3. Access via: `file://server/training/trainer.html`
4. **Best for**: Offline-first, maximum privacy

All options achieve the same results - choose based on your IT infrastructure.

---

## 📊 Admin Dashboard Operations

### **Accessing Admin Panel**
- **In-app**: Press keyboard shortcut `A` or click purple dashboard button
- **Password**: None (add later if needed)

### **Leaderboard Tab** 🏆
**Daily use:**
- View current staff rankings by XP
- Identify high performers and those needing support
- Export screenshot for weekly reports

**Metrics shown:**
- 🥇 Top 3 staff highlighted with medals
- XP points (experience earned)
- Scenarios completed
- Average response score (A-F)

### **Data Manager Tab** 💾

**Weekly Export Backup:**
1. Click **"Export as JSON"**
2. File downloads automatically
3. Save in: `\\facility\backups\training-lab\2026-02-17-backup.json`
4. Repeat weekly (automated via task scheduler recommended)

**Merging Multiple Sites:**
1. Collect exports from North Unit, South Unit, ICU, etc.
2. Open each export file in this facility's Admin Dashboard
3. Click **"Import Team Data"** for each file
4. Admin dashboard now shows combined leaderboard

**Data Recovery:**
1. If staff computer loses data
2. Have them import from previous backup export
3. Their progress restores instantly

### **Settings Tab** ⚙️
**Organization Setup:**
- Facility Name: "Destiny Springs Healthcare"
- Trainer Name: "Your Name" (appears on certificates)
- These values persist in localStorage

**Statistics:**
- Total Scenarios Completed (facility-wide)
- Total Active Trainees
- Average XP per trainee (facility-wide)

---

## 🎓 Staff Training Workflow

### **Week 1: Initial Training**
1. Distribute `trainer.html` to all staff
2. Send them the `QUICK_START.md` guide
3. They open file + get free Gemini API key
4. Complete 11 slides (30-45 min)

### **Week 2-3: Individual Practice**
- Staff complete 5+ crisis scenarios each
- Each completion records score + XP
- Data automatically saves
- Trainer tips guide improvement

### **Week 4: Performance Review**
1. Admin opens Admin Dashboard
2. Reviews leaderboard performance
3. Identifies who needs refresher training
4. Data manager exports trend report

### **Month-End: Compliance Documentation**
1. Admin exports all staff training records
2. Stores in compliance folder with dates
3. Staff can download individual certificates
4. Archive for accreditation reviews

---

## 📈 Recommended KPIs to Track

| Metric | Target | Frequency | Use |
|--------|--------|-----------|-----|
| Staff Completion Rate | 100% | Monthly | Identify non-compliance |
| Avg Response Score | B or higher | Weekly | Quality of training |
| Scenarios Per Trainee | 10+ | Monthly | Engagement level |
| Total Facility XP | 5000+ | Monthly | Training intensity |

---

## 🔐 Security & Compliance

### **Data Backup Protocol**
- **When**: Every Friday
- **How**: Admin Dashboard → Export as JSON
- **Where**: Encrypted network folder
- **Retention**: 1 year minimum (per HIPAA)

### **Access Control**
Currently: **No authentication** (suitable for internal systems)

**To add staff authentication later:**
1. Contact developer for login module
2. Would require backend database
3. Estimated time: 2-3 weeks
4. Cost: Negotiable

### **Data Privacy**
✅ NO patient data collected (training only)  
✅ Staff names only personally identifiable data  
✅ No connection to patient record systems  
✅ API key never stored (entered fresh each session)  
✅ Compliant with training documentation requirements

---

## 🛠️ Troubleshooting & Maintenance

### **Staff Reports: "Data disappeared"**
**Cause**: Browser cache cleared or Incognito mode used  
**Solution**:
1. Have staff retrain (starts fresh)
2. Or restore from backup export if available
3. Prevention: Send weekly "Backup your data" reminders

### **API Key Issues**
**Symptom**: "API Error" or scenarios won't load  
**Solution**:
1. Staff gets new key from https://aistudio.google.com/
2. Verify they have API quota remaining
3. Clear browser cache + try again
4. Switch to different browser if problem persists

### **Leaderboard Not Updating**
**Cause**: Different browsers = different localStorage  
**Solution**:
1. All staff train on same computer OR
2. Admin manually imports each export file
3. Each browser is independent data store

### **Export File Won't Import**
**Cause**: File corrupted or wrong format  
**Solution**:
1. Verify file is `.json` not `.txt`
2. Open in text editor to check format (should start with `{`)
3. Try exporting again from original computer
4. Contact developer if still broken

### **Certificate PDF Fails to Download**
**Cause**: Pop-up blocker or browser issue  
**Solution**:
1. Disable pop-up blockers for this site
2. Try different browser
3. Check Downloads folder for hidden files
4. Try again after page refresh

---

## 📞 Support Workflow

### **For Trainer/Admin Questions**
1. Check README.md
2. Check DATA_ARCHITECTURE.md
3. Check GitHub issues page

### **For Technical Issues**
1. Clear browser cache
2. Try different browser
3. Restart computer
4. Update browser to latest version
5. If still broken: Create GitHub issue with screenshots

### **For Enhancement Requests**
- Feature tracking: GitHub Issues
- Prioritization: Most requested implemented first
- Roadmap: See GitHub Projects board

---

## 📋 Monthly Operations Checklist

```
□ Week 1:
  □ Review leaderboard for completion rates
  □ Identify staff who haven't started
  □ Send reminder emails

□ Week 2:
  □ Spot-check 2-3 staff responses for quality
  □ Note any API key issues

□ Week 3:
  □ Export backup to secure storage
  □ Document any training gaps

□ Week 4:
  □ Final audit of all progress
  □ Create compliance report
  □ Plan next month's focus areas
  □ Update admin with metrics
```

---

## 💡 Pro Tips

1. **Stagger training** by unit (North Week 1, South Week 2, etc.) to manage API quota

2. **Use the debrief feature** - Have staff submit real incidents for AI coaching

3. **Celebrate wins** - Screenshot top performers for team morale

4. **Refresher schedule** - Require quarterly re-training (simpler practice scenarios)

5. **Integration idea** - Link completion records to staff performance reviews

6. **Multi-site**: Keep separate exports per unit for granular tracking

7. **Customize scenarios** - Ask developer to add facility-specific situations

8. **Mobile training** - Staff can train on tablets during breaks

---

## 🔄 Git Version Control

Repository is backed up on GitHub automatically. All code versions are tracked.

**To pull latest updates:**
```powershell
cd "\\192.168.168.182\Folder Redirection\Ccooper\Documents\Training Lab"
git pull origin main
```

**To view commit history:**
Visit: https://github.com/cmc-creator/Training-Lab/commits/main

---

## 📞 Contact & Support

- **GitHub Issues**: https://github.com/cmc-creator/Training-Lab/issues
- **Email Support**: (add your facility contact here)
- **Training**: See QUICK_START.md for staff

---

**System Version**: 2.0  
**Last Updated**: February 17, 2026  
**Created For**: Destiny Springs Healthcare - Inpatient Psychiatric Acute Care  
**Status**: ✅ Production Ready
