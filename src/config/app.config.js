/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

/**
 * Main Application Configuration
 * 
 * This file contains all customizable settings for the sports club registration app.
 * Modify these values to customize the app for different clubs.
 */

const appConfig = {
  // ===========================================
  // BRANDING
  // ===========================================
  branding: {
    // Club name displayed in header
    clubName: 'Oulun Kickboxing ry',
    // Short name/abbreviation
    clubShortName: 'OKB',
    // App title shown in browser tab
    appTitle: 'OKB Rekisteröinti',
    // Logo path (relative to public folder)
    logoPath: '/logo.svg',
    // Contact email
    contactEmail: 'webmaster@oulunkickboxing.fi',
    // Website URL
    websiteUrl: 'https://www.oulunkickboxing.fi',
  },

  // ===========================================
  // FEATURES (enable/disable modules)
  // ===========================================
  features: {
    // Trainee registration module
    traineeRegistration: true,
    // Coach/instructor registration module
    coachRegistration: true,
    // Camp management in admin
    campManagement: true,
    // Session/course management in admin
    sessionManagement: true,
    // Performance reports in admin
    performanceReports: true,
    // Coach experience tracking
    coachExperience: true,
    // Age group selection for trainees
    ageGroupSelection: true,
    // Under-18 age input requirement
    minorAgeInput: true,
    // Admin panel access
    adminPanel: true,
    // Admin password protection
    adminPasswordProtection: true,
  },

  // ===========================================
  // SESSION TYPES
  // Define available training session types
  // ===========================================
  sessionTypes: {
    // Trainee session types (for regular members)
    trainee: [
      { id: 'vapaa_sparri', name: 'VAPAA/SPARRI', label: 'Vapaa / Sparri' },
    ],
    // Coach session types (for instructors)
    coach: [
      { id: 'jatko', name: 'JATKO', label: 'Jatkoryhmä' },
      { id: 'kunto', name: 'KUNTO', label: 'Kuntopotkis' },
      { id: 'peku', name: 'PEKU', label: 'Peruskurssi' },
    ],
    // Course types for session management
    courses: [
      { id: 'basic', name: 'basic', label: 'Peruskurssi' },
      { id: 'advanced', name: 'advanced', label: 'Jatkokurssi' },
      { id: 'fitness', name: 'fitness', label: 'Kuntopotkis' },
    ],
  },

  // ===========================================
  // AGE GROUPS
  // ===========================================
  ageGroups: {
    enabled: true,
    options: [
      { id: 'adult', name: '18+ vuotias', label: '18+ vuotias', isMinor: false },
      { id: 'minor', name: 'alle 18-vuotias', label: 'Alle 18-vuotias', isMinor: true },
    ],
    // Minimum and maximum age for minors
    minorAgeRange: { min: 1, max: 17 },
  },

  // ===========================================
  // LOCALIZATION
  // ===========================================
  localization: {
    // Default locale
    defaultLocale: 'fi',
    // Available locales
    availableLocales: ['fi', 'en'],
    // Date format
    dateFormat: 'dd.MM.yyyy',
    // Time zone
    timeZone: 'Europe/Helsinki',
  },

  // ===========================================
  // THEME
  // ===========================================
  theme: {
    // Theme preset: 'dark', 'light', or 'custom'
    preset: 'dark',
    // Custom theme overrides (used when preset is 'custom')
    custom: {
      // See theme.config.js for all available options
    },
  },

  // ===========================================
  // ADMIN SETTINGS
  // ===========================================
  admin: {
    // Default admin password (should be changed!)
    defaultPassword: 'admin123',
    // Session timeout in minutes (0 = no timeout)
    sessionTimeout: 30,
    // Show coach monthly statistics chart
    showCoachStatsChart: true,
    // Coach hours multiplier (hours = registrations × multiplier)
    coachHoursMultiplier: 1.5,
  },

  // ===========================================
  // REGISTRATION SETTINGS
  // ===========================================
  registration: {
    // Allow same-day registration
    allowSameDayRegistration: true,
    // Allow future date registration
    allowFutureDateRegistration: true,
    // Maximum days in future for registration (0 = unlimited)
    maxFutureDays: 0,
    // Allow past date registration
    allowPastDateRegistration: false,
    // Show confirmation dialog before submitting
    showConfirmationDialog: true,
    // Auto-clear form after successful registration
    autoClearForm: true,
  },

  // ===========================================
  // API CONFIGURATION
  // ===========================================
  api: {
    // Cache TTL in milliseconds (60000 = 1 minute)
    cacheTTL: 60000,
    // Enable caching
    enableCache: true,
  },
};

export default appConfig;
