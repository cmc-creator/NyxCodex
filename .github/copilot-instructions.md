# GitHub Copilot Instructions for Training Lab

## Project Overview

This is Destiny Springs Healthcare's De-escalation Training Lab - an interactive, AI-powered clinical training platform for psychiatric healthcare professionals. The platform is built as a static web application deployed via GitHub Pages.

## Core Architecture

- **Platform Type**: Static HTML/CSS/JavaScript web application
- **Deployment**: GitHub Pages (https://cmc-creator.github.io/Training-Lab/)
- **Backend**: Firebase (Authentication + Realtime Database)
- **AI Integration**: Google Gemini API for training scenarios
- **Entry Point**: `index.html` (landing page that redirects to `trainer_pro.html`)

## Key Files

- `index.html` - Landing page (ALWAYS use as entry point for users)
- `trainer_pro.html` - Production trainer with Firebase backend
- `trainer.html` - Standalone trainer with local storage only
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment instructions
- `START_HERE.md` - Quick start guide for new administrators

## Development Guidelines

### Mobile-First Development

**CRITICAL**: This platform MUST be mobile-friendly. Always prioritize mobile responsiveness:

1. **Design for mobile first, then scale up** to tablets and desktops
2. Use responsive CSS with media queries for different screen sizes
3. Test all UI changes on mobile viewports (320px, 375px, 414px)
4. Ensure touch-friendly controls (min 44px touch targets)
5. Optimize for both portrait and landscape orientations
6. Use viewport meta tags: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

### Landing Page Priority

**ALWAYS start users from the landing page** (`index.html`):

1. Never link directly to `trainer_pro.html` or `trainer.html` in documentation
2. All user-facing URLs should point to the root or `index.html`
3. The landing page handles proper redirection to the training platform
4. Maintain the landing page's redirect functionality when making changes

### Code Standards

1. **HTML/CSS/JavaScript**: Keep all code in single files for easy GitHub Pages deployment
2. **No Build Process**: Avoid adding build tools or bundlers unless absolutely necessary
3. **Progressive Enhancement**: Core functionality must work without JavaScript when possible
4. **Accessibility**: Follow WCAG 2.1 AA standards (healthcare compliance requirement)
5. **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge - 2022+)

### Firebase Integration

1. **Never commit API keys**: Firebase config should be documented but not hardcoded with real values
2. **Security Rules**: Always validate Firebase security rules before suggesting database changes
3. **Authentication**: Use Firebase Auth for all user management
4. **Data Structure**: Follow the schema documented in `DATA_ARCHITECTURE.md`

### Healthcare Compliance

1. **HIPAA Awareness**: No PHI (Protected Health Information) should be stored in training data
2. **Data Privacy**: User training data is sensitive - handle with care
3. **Secure Communications**: Always use HTTPS, never HTTP
4. **Password Security**: Enforce strong password policies in authentication

## Common Tasks

### Adding New Training Content

1. Edit `trainer_pro.html` to add new slides or scenarios
2. Ensure content is mobile-responsive
3. Test on multiple screen sizes
4. Update navigation if needed
5. Document changes in commit messages

### Updating Styling

1. Inline styles are acceptable for this single-page app architecture
2. Maintain consistent design language (purple gradient theme)
3. Test on mobile devices first
4. Ensure sufficient color contrast for accessibility

### Modifying Firebase Configuration

1. Always reference `FIREBASE_SETUP.md` for current configuration
2. Test security rules in Firebase Console before deployment
3. Document any schema changes in `DATA_ARCHITECTURE.md`
4. Verify changes don't break existing user data

## Testing Guidelines

1. **Mobile Testing**: Use browser DevTools mobile emulation
2. **Cross-Browser**: Test in Chrome, Firefox, Safari, and Edge
3. **Authentication**: Test signup, login, logout, password reset flows
4. **Data Persistence**: Verify data saves and loads correctly
5. **Admin Dashboard**: Test keyboard shortcut 'A' and admin features

## Documentation Standards

1. **User-Facing**: Write for healthcare professionals, not developers
2. **Technical**: Provide detailed steps with examples
3. **Troubleshooting**: Include common issues and solutions
4. **Screenshots**: Use when documenting UI changes

## Deployment Process

1. Changes to `main` branch automatically deploy via GitHub Actions
2. Deployment takes 1-2 minutes
3. No build step required - direct file deployment
4. Test locally before pushing to `main`

## Security Best Practices

1. **No Secrets in Code**: Use environment-specific configuration
2. **Input Validation**: Sanitize all user inputs
3. **XSS Prevention**: Escape HTML in user-generated content
4. **CSRF Protection**: Implement for any state-changing operations
5. **Dependency Security**: Minimize external dependencies

## Mobile-Specific Considerations

### Viewport Optimization
- Use flexible layouts (flexbox, grid)
- Avoid fixed pixel widths
- Use relative units (%, em, rem, vh, vw)

### Performance
- Minimize file sizes (images, scripts)
- Lazy load content when appropriate
- Optimize for slow mobile networks
- Reduce HTTP requests

### Touch Interactions
- Large, tappable buttons (minimum 44x44px)
- Avoid hover-only interactions
- Support swipe gestures where appropriate
- Provide visual feedback for touches

### Text Readability
- Minimum 16px font size on mobile
- Adequate line height (1.5+)
- Sufficient color contrast (4.5:1 minimum)
- No horizontal scrolling required

## Common Issues and Solutions

### "Data not persisting"
- Check Firebase configuration in `trainer_pro.html`
- Verify Firebase security rules
- Check browser console for errors

### "Mobile layout broken"
- Test viewport meta tag is present
- Check CSS media queries
- Verify touch target sizes

### "Landing page not redirecting"
- Verify `index.html` redirect code is intact
- Check for JavaScript errors in console
- Test meta refresh tag is functioning

## When Making Changes

1. **Always consider mobile impact first**
2. **Preserve the landing page workflow**
3. **Test on actual mobile devices when possible**
4. **Update documentation if user-facing changes**
5. **Maintain backward compatibility with existing user data**
6. **Follow existing code style and patterns**

## Questions to Ask Before Implementing

- Will this work on a 320px wide screen?
- Does this start from the landing page?
- Is this accessible to healthcare workers with varying technical skills?
- Does this maintain HIPAA compliance?
- Will this break existing user data?
- Can this be tested without a build process?

## Support Resources

- `START_HERE.md` - Quick setup guide
- `DEPLOYMENT_GUIDE.md` - Detailed deployment steps
- `ADMIN_MANUAL.md` - Admin dashboard documentation
- `FIREBASE_SETUP.md` - Firebase configuration details
- `DATA_ARCHITECTURE.md` - Database schema reference
- `OPERATIONS_CHECKLIST.md` - Maintenance procedures
