# Destiny Springs Healthcare - De-escalation Training Lab

An interactive, AI-powered clinical training platform for psychiatric healthcare professionals. Built for Destiny Springs Healthcare inpatient acute care facility.

## Features

✨ **AI Clinical Mentor** - Dr. Rivera guides you through real-world scenarios
🧩 **Diagnosis-Specific Training** - Autism, ADHD, Schizophrenia, Bipolar, PTSD, Depression, Anxiety, BPD
🎮 **Interactive Crisis Scenarios** - Practice responses with AI scoring (A-F)
📊 **Team Leaderboard** - Track progress across your entire staff
🏆 **Achievement System** - XP, certificates, performance tracking
🤖 **Roleplay Script Generator** - Create huddle training materials instantly
📝 **Clinical Debrief Assistant** - AI supervisor feedback on real incidents
💻 **Desktop Application with Mobile Support** - Optimized for desktop/laptop use, also accessible on tablets and phones
🎓 **PDF Certificates** - Print professional training completion documents

## 🚀 Production Platform

**Live Training Platform:** [https://cmc-creator.github.io/Training-Lab/](https://cmc-creator.github.io/Training-Lab/)

Staff can access the platform directly from any device with internet connection. The platform features:
- Secure user authentication (email/password)
- Cloud-based data persistence via Firebase
- Real-time admin dashboard with team analytics
- Desktop-first design with mobile adaptation for phones, tablets, and portable devices

### For Staff
1. Visit the live platform URL above
2. Click "Sign Up" to create your account
3. Use your facility email and create a secure password
4. Start training immediately!

### For Administrators
1. Log in with your admin credentials
2. Press the **"A"** key to access the Admin Dashboard
3. View team leaderboard, user analytics, and generate reports

## Quick Start (Local Development)

### 1. Get a Free Gemini API Key
- Go to [Google AI Studio](https://aistudio.google.com/)
- Click "Create API Key"
- Copy your key (keep it secret!)

### 2. Run the Trainer Locally
- Open `trainer.html` in any modern web browser
- Paste your API key when prompted on the Interactive Lab slide
- Start training!

## How Data is Saved

Your progress is automatically saved to your browser's local storage:
- ✅ Scenarios completed
- ✅ Response scores (A-F)
- ✅ XP earned
- ✅ Completed diagnoses
- ✅ Personal notes

### For Teams/Organizations

**Export Team Progress:**
1. Each employee trains using their browser
2. Use the **Admin Dashboard** (accessible from the menu)
3. Export all staff progress as JSON
4. View team leaderboard

**Import Data:**
- Admin can import previously exported JSON files
- Merge multiple employee datasets
- Backup and restore training records

## Usage

### Slides
- **Slides 1-6**: Core de-escalation concepts
- **Slide 7**: Diagnosis-specific training library
- **Slide 8**: Interactive crisis scenarios & script builder
- **Slide 9**: Clinical debrief assistant
- **Slide 10**: Quick reference checklist
- **Slide 11**: Completion summary

### Controls
- **Right/Left Arrow Keys**: Navigate slides
- **Navigation Buttons**: Bottom right of screen
- **Keyboard Shortcut**: Press `A` for Admin Dashboard

## Admin Dashboard

Access with keyboard shortcut `A` or find the admin link in the menu.

Features:
- 📊 View all staff progress
- 🏆 Team leaderboard
- 📥 Import/export JSON data
- 🎓 Generate certificates
- 👥 Manage trainees

## Data Privacy & Security

⚠️ **Important Security Notes:**
- Your API key should NEVER be committed to Git
- Each user enters their own API key when using the platform
- Local storage is encrypted by your browser
- Data is never sent to external servers (except Gemini AI for analysis)

## Deployment

This platform is automatically deployed to GitHub Pages whenever changes are pushed to the `main` branch.

### Deployment Process
1. The GitHub Actions workflow (`.github/workflows/deploy.yml`) is triggered on push to `main`
2. The workflow builds and deploys the static site to GitHub Pages
3. The site becomes available at: https://cmc-creator.github.io/Training-Lab/
4. Deployment typically takes 1-2 minutes

### Manual Deployment
If you need to manually deploy:
1. Go to the repository Settings → Pages
2. Ensure source is set to "GitHub Actions"
3. Trigger the workflow manually from the Actions tab

### Deployment Configuration
- **Platform**: GitHub Pages (free hosting for static sites)
- **Backend**: Firebase (authentication and database)
- **CI/CD**: GitHub Actions (automated deployment)
- **Custom Domain**: Can be configured in GitHub Pages settings

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## File Structure

```
Training Lab/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment workflow
├── index.html               # Landing page (redirects to trainer_pro)
├── trainer.html             # Standalone trainer (local storage)
├── trainer_pro.html         # Production trainer (Firebase backend)
├── README.md               # This file
├── DEPLOYMENT_GUIDE.md     # Detailed deployment instructions
├── .gitignore              # Prevents API keys from being committed
└── backups/                # Your exported training data backups
```

## Troubleshooting

**API Key not working?**
- Verify the key is from Google AI Studio
- Check that you have API quota remaining
- Try pasting the key again

**Data not saving?**
- Check browser's local storage quota (usually 5-10MB)
- Clear old data via Admin Dashboard
- Try a different browser

**Scenarios not loading?**
- Ensure API key is active
- Check browser console (F12) for errors
- Verify internet connection

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge - 2022+)
- Active internet connection (for AI features)
- Google Gemini API key

## Future Features

- 🔐 Authentication & multi-user accounts
- ☁️ Cloud backup of training data
- 📈 Advanced analytics & reporting
- 🎤 Voice-based scenario practice
- 🌐 Multi-language support
- 🔗 LMS integration (Canvas, Blackboard)

## Support

For issues or feature requests, create an issue in this repository.

## License

Internal use only - Destiny Springs Healthcare

---

**Version**: 2.0  
**Last Updated**: February 2026  
**Created for**: Destiny Springs Healthcare Psychiatric Acute Care
