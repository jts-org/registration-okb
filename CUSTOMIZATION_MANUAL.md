# 🎨 Customization Manual

## Sports Club Registration App - Configuration Guide

This manual provides comprehensive instructions for customizing the Sports Club Registration App for your organization.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Files Overview](#configuration-files-overview)
3. [Branding Customization](#branding-customization)
4. [Feature Flags](#feature-flags)
5. [Session Types & Age Groups](#session-types--age-groups)
6. [Theme Customization](#theme-customization)
7. [Language/Localization](#languagelocalization)
8. [Backend Configuration](#backend-configuration)
9. [Advanced Customization](#advanced-customization)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Minimum Required Changes

To rebrand the app for your club, you only need to modify **one file**:

```
src/config/app.config.js
```

**Essential changes:**

```javascript
branding: {
  clubName: 'Your Club Name',        // Main header title
  clubShortName: 'YCN',              // Abbreviation
  appTitle: 'YCN Registration',      // Browser tab title
  contactEmail: 'info@yourclub.com', // Contact email
  websiteUrl: 'https://yourclub.com' // Club website
}
```

---

## 📁 Configuration Files Overview

| File | Purpose |
|------|---------|
| `src/config/app.config.js` | Main configuration (branding, features, data) |
| `src/config/theme.config.js` | Theme presets and color schemes |
| `src/config/locales/fi.json` | Finnish translations |
| `src/config/locales/en.json` | English translations |
| `src/contexts/ConfigContext.js` | React context providers |

---

## 🏷️ Branding Customization

### Full Branding Options

Edit `src/config/app.config.js`:

```javascript
branding: {
  // Primary club name (displayed in header)
  clubName: 'Your Sports Club Name',
  
  // Short name/abbreviation
  clubShortName: 'YSC',
  
  // Browser tab title
  appTitle: 'YSC Training Registration',
  
  // Path to logo (place in /public folder)
  logoPath: '/your-logo.svg',
  
  // Contact information
  contactEmail: 'info@yoursportsclub.com',
  websiteUrl: 'https://yoursportsclub.com',
}
```

### Changing the Logo

1. Place your logo file in the `/public` folder
2. Update `logoPath` in the config
3. For the app logo in header, replace `/src/logo_new_reversed_colors.png`

**Supported formats:** SVG (recommended), PNG, JPG

---

## ⚙️ Feature Flags

Enable or disable specific features by setting them to `true` or `false`:

```javascript
features: {
  // Registration modules
  traineeRegistration: true,   // Member/trainee sign-up
  coachRegistration: true,     // Coach/instructor sign-up
  
  // Admin features
  adminPanel: true,            // Admin access
  campManagement: true,        // Camp/event management
  sessionManagement: true,     // Training session management
  performanceReports: true,    // Statistics and reports
  
  // Trainee options
  ageGroupSelection: true,     // Adult/minor selection
  minorAgeInput: true,         // Age input for minors
  
  // Coach options
  coachExperience: true,       // Track coaching experience
}
```

### Feature Use Cases

| Feature | When to Enable | When to Disable |
|---------|----------------|-----------------|
| `traineeRegistration` | Most clubs | Coach-only app |
| `coachRegistration` | Clubs with volunteer coaches | No coach tracking needed |
| `campManagement` | Clubs hosting camps/events | Regular sessions only |
| `ageGroupSelection` | Mixed adult/youth programs | Adults only |
| `coachExperience` | Track coaching hours | No tracking needed |

---

## 🎯 Session Types & Age Groups

### Configuring Session Types

Define the training session types for your club:

```javascript
sessionTypes: [
  { id: 'beginner', label: 'Beginner', description: 'For new members' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience required' },
  { id: 'advanced', label: 'Advanced', description: 'Experienced athletes' },
  { id: 'competition', label: 'Competition Team', description: 'Competition training' },
  { id: 'fitness', label: 'Fitness Class', description: 'General fitness' },
]
```

### Configuring Age Groups

Customize age categories:

```javascript
ageGroups: [
  { id: 'adult', label: '18+ years', minAge: 18, maxAge: null },
  { id: 'youth', label: 'Under 18', minAge: 0, maxAge: 17 },
]
```

**Examples for different sports:**

```javascript
// Swimming club with multiple age divisions
ageGroups: [
  { id: 'tots', label: '4-6 years', minAge: 4, maxAge: 6 },
  { id: 'juniors', label: '7-12 years', minAge: 7, maxAge: 12 },
  { id: 'teens', label: '13-17 years', minAge: 13, maxAge: 17 },
  { id: 'adults', label: '18+ years', minAge: 18, maxAge: null },
  { id: 'masters', label: '40+ Masters', minAge: 40, maxAge: null },
]

// Martial arts club
ageGroups: [
  { id: 'kids', label: 'Kids (6-12)', minAge: 6, maxAge: 12 },
  { id: 'teens', label: 'Teens (13-17)', minAge: 13, maxAge: 17 },
  { id: 'adults', label: 'Adults (18+)', minAge: 18, maxAge: null },
]
```

---

## 🎨 Theme Customization

### Using Built-in Themes

Available in `src/config/theme.config.js`:

| Theme | Description |
|-------|-------------|
| `dark` | Dark purple/blue (default) |
| `light` | Light modern theme |
| `kickboxing` | Red/black martial arts theme |
| `football` | Green sports field theme |
| `swimming` | Blue aquatic theme |
| `gymnastics` | Purple athletic theme |
| `tennis` | Green court theme |

### Applying a Theme

In your App wrapper or `ConfigurationProvider`:

```jsx
<ConfigurationProvider theme="swimming">
  <App />
</ConfigurationProvider>
```

### Creating a Custom Theme

Add to `themes` object in `theme.config.js`:

```javascript
yourClubTheme: {
  name: 'Your Club Theme',
  colors: {
    // Background colors
    background: '#0f1015',
    backgroundSecondary: '#1a1a25',
    surface: '#252530',
    
    // Brand colors
    primary: '#YOUR_PRIMARY_COLOR',
    primaryHover: '#YOUR_HOVER_COLOR',
    secondary: '#YOUR_SECONDARY_COLOR',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#a0a0b0',
    textMuted: '#6b6b7b',
    
    // Semantic colors
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    
    // UI elements
    border: '#2a2a3e',
    inputBackground: '#12121a',
  },
  fonts: {
    primary: "'Inter', 'Segoe UI', sans-serif",
    heading: "'Inter', 'Segoe UI', sans-serif",
  },
  borderRadius: '8px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  }
}
```

### Using Theme in Components

```jsx
import { useTheme } from '../contexts/ConfigContext';

function MyComponent() {
  const { currentTheme, setTheme, themeStyles } = useTheme();
  
  return (
    <div style={{ background: themeStyles.colors.background }}>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

---

## 🌍 Language/Localization

### Supported Languages

| Code | Language |
|------|----------|
| `fi` | Finnish (default) |
| `en` | English |

### Changing Default Language

In `app.config.js`:

```javascript
localization: {
  defaultLocale: 'en',  // Change to 'en' for English default
  supportedLocales: ['fi', 'en'],
  dateFormat: 'DD.MM.YYYY',
  timeFormat: '24h',
}
```

### Using Translations in Components

```jsx
import { useTranslation } from '../contexts/ConfigContext';

function MyComponent() {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('traineeRegistration.selectSession')}</p>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### Adding a New Language

1. Create a new file: `src/config/locales/[code].json`

2. Copy structure from `en.json` and translate:

```json
{
  "app": {
    "title": "Your App Title",
    "subtitle": "Training Registration"
  },
  "navigation": {
    "trainingSessions": "Training Sessions",
    "coaches": "Coaches",
    "admin": "Admin"
  }
  // ... continue translating all keys
}
```

3. Register in `ConfigContext.js`:

```javascript
import sv from '../config/locales/sv.json';  // Swedish

const locales = {
  fi: fiLocale,
  en: enLocale,
  sv: svLocale,  // Add new locale
};
```

4. Add to supported locales in `app.config.js`:

```javascript
supportedLocales: ['fi', 'en', 'sv']
```

### Translation Key Structure

```
app.*             - App-level strings
navigation.*      - Menu and navigation
traineeRegistration.* - Trainee form labels
coachRegistration.*   - Coach form labels
admin.*           - Admin panel strings
campManagement.*  - Camp management
sessionManagement.* - Session management
performanceReport.* - Reports and statistics
notifications.*   - Success/error messages
validation.*      - Form validation errors
common.*          - Shared strings (buttons, labels)
```

---

## 🔧 Backend Configuration

### Google Apps Script Setup

1. Open Google Sheets with your data
2. Go to **Extensions > Apps Script**
3. Replace `Code.gs` with content from `src/app_script/Code.gs`
4. Deploy as web app:
   - Click **Deploy > New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (or your organization)
5. Copy the web app URL

### API Configuration

In `app.config.js`:

```javascript
api: {
  // Your Google Apps Script web app URL
  baseUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  
  // Cache duration in seconds (60 = 1 minute)
  cacheTTL: 60,
  
  // Request timeout in milliseconds
  timeout: 30000,
}
```

### Google Sheets Structure

Required sheets in your spreadsheet:

| Sheet Name | Purpose | Columns |
|------------|---------|---------|
| `trainees` | Trainee registrations | timestamp, firstName, lastName, sessionType, date, ageGroup, age |
| `coaches` | Coach registrations | timestamp, firstName, lastName, sessionType, date |
| `camps` | Camp definitions | id, name, startDate, sessionsPerDay |
| `sessions` | Regular sessions | id, type, name, startDate, endDate |
| `settings` | App settings | key, value |
| `coaches_experience` | Coach tracking | name, year, sessions |

---

## 🔬 Advanced Customization

### Using Feature Flags in Components

```jsx
import { useFeature, useFeatureFlags } from '../contexts/ConfigContext';

function AdminPanel() {
  // Single feature check
  const hasReports = useFeature('performanceReports');
  
  // All features
  const features = useFeatureFlags();
  
  return (
    <div>
      {hasReports && <PerformanceReports />}
      {features.campManagement && <CampManagement />}
      {features.sessionManagement && <SessionManagement />}
    </div>
  );
}
```

### Custom Configuration Extension

You can extend the default config at runtime:

```jsx
import { appConfig } from './config';

// Custom config for a specific deployment
const customConfig = {
  ...appConfig,
  branding: {
    ...appConfig.branding,
    clubName: 'Custom Club Name',
  },
  features: {
    ...appConfig.features,
    campManagement: false,  // Disable for this deployment
  }
};

// Use in provider
<ConfigurationProvider config={customConfig}>
  <App />
</ConfigurationProvider>
```

### Environment-Based Configuration

Create environment-specific configs:

```javascript
// config/environments.js
const configs = {
  development: {
    api: { baseUrl: 'http://localhost:3001' }
  },
  staging: {
    api: { baseUrl: 'https://staging-api.example.com' }
  },
  production: {
    api: { baseUrl: 'https://api.example.com' }
  }
};

export const envConfig = configs[process.env.NODE_ENV] || configs.development;
```

---

## ❓ Troubleshooting

### Common Issues

#### 1. Translations not appearing

**Problem:** Text shows translation keys like `app.title` instead of actual text.

**Solution:**
- Check that the locale file exists in `src/config/locales/`
- Verify the translation key exists in the JSON file
- Ensure `LocaleProvider` is wrapping your app

#### 2. Theme not applying

**Problem:** Colors don't change when switching themes.

**Solution:**
- Check browser console for CSS variable errors
- Verify theme name exists in `theme.config.js`
- Ensure `ThemeProvider` is in the component tree

#### 3. Features still visible when disabled

**Problem:** Disabled features still appear in the UI.

**Solution:**
- Clear browser cache
- Verify feature flag is `false` (not `'false'` string)
- Check component uses `useFeature()` hook

#### 4. API connection errors

**Problem:** Data not loading, network errors.

**Solution:**
- Verify Google Apps Script is deployed
- Check deployment URL in `app.config.js`
- Ensure CORS is configured in Apps Script:
  ```javascript
  function doGet(e) {
    // Allow CORS
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  ```

### Debug Mode

Enable debug logging:

```javascript
// In app.config.js
debug: {
  enabled: true,
  logLevel: 'verbose',  // 'error', 'warn', 'info', 'verbose'
}
```

### Getting Help

1. Check the console for error messages
2. Review the [README.md](./README.md) for setup instructions
3. Check [CONSTANTS_DOCUMENTATION.md](./CONSTANTS_DOCUMENTATION.md) for data structures

---

## 📝 Configuration Checklist

Use this checklist when setting up for a new club:

- [ ] Update `clubName` and `clubShortName`
- [ ] Replace logo file
- [ ] Update contact information
- [ ] Configure enabled features
- [ ] Set up session types for your sport
- [ ] Configure age groups if needed
- [ ] Choose or customize theme
- [ ] Update translations if needed
- [ ] Set up Google Sheets backend
- [ ] Deploy Google Apps Script
- [ ] Test all registration flows
- [ ] Test admin functionality

---

## 🎯 Quick Reference

### File Locations

```
src/
├── config/
│   ├── app.config.js      ← Main configuration
│   ├── theme.config.js    ← Theme definitions
│   ├── index.js           ← Exports
│   └── locales/
│       ├── fi.json        ← Finnish translations
│       └── en.json        ← English translations
├── contexts/
│   └── ConfigContext.js   ← React providers
└── constants.js           ← Legacy constants (being migrated)
```

### Key Hooks

```jsx
// Configuration
const config = useAppConfig();          // Full config object
const t = useTranslation();              // Translation function
const features = useFeatureFlags();      // All feature flags
const isEnabled = useFeature('name');    // Single feature check

// Theme
const { currentTheme, setTheme, themeStyles } = useTheme();
const { locale, setLocale } = useLocale();
```

---

*Last updated: 2025*
