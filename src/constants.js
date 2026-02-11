/**
 * Application Constants
 * 
 * This file integrates with app.config.js and locale files for customizable values.
 * Static keys and identifiers remain here, while labels come from config/locales.
 */

import appConfig from './config/app.config';

// ============================================
// NAVIGATION TABS (Static keys - do not change)
// ============================================
export const TABS = {
  MAIN: 'main',
  TRAINING_SESSION: 'training_session',
  CAMP: 'camp',
  COACH: 'coach',
  ADMIN: 'admin',
  ABOUT: 'about',
  CONTACT: 'contact',
};

// ============================================
// SESSION TYPES (From config)
// ============================================

// Trainee session types
export const SESSION_TYPES = appConfig.sessionTypes.trainee.reduce((acc, type) => {
  acc[type.id.toUpperCase()] = type.name;
  return acc;
}, {});

// Coach session types
export const COACHING_SESSIONS_TYPES = appConfig.sessionTypes.coach.reduce((acc, type) => {
  acc[type.id.toUpperCase()] = type.name;
  return acc;
}, {});

// Course types for admin
export const COURSE_TYPES = appConfig.sessionTypes.courses.reduce((acc, type) => {
  acc[type.id.toUpperCase()] = type.name;
  return acc;
}, {});

// ============================================
// AGE GROUPS (From config)
// ============================================
export const AGE_GROUPS = appConfig.ageGroups.options.reduce((acc, group) => {
  acc[group.id.toUpperCase()] = group.name;
  return acc;
}, {});

// Age range for minors
export const MINOR_AGE_RANGE = appConfig.ageGroups.minorAgeRange;

// ============================================
// ARRAYS FOR DROPDOWNS (Derived from config)
// ============================================

// Session options array (trainee)
export const SESSION_OPTIONS = appConfig.sessionTypes.trainee.map(type => type.name);

// Coaching session types array (coach)
export const COACHING_SESSION_OPTIONS = appConfig.sessionTypes.coach.map(type => type.name);

// Age group options array
export const AGE_GROUP_OPTIONS = appConfig.ageGroups.options.map(group => group.name);

// Course type options array (for admin)
export const COURSE_TYPE_OPTIONS = appConfig.sessionTypes.courses.map(type => ({
  value: type.name,
  label: type.label,
}));

// ============================================
// LEGACY SUPPORT - Tab labels and mapping
// These are kept for backward compatibility but
// components should migrate to useTranslation()
// ============================================

// Tab labels (Finnish - hardcoded for legacy support)
export const TAB_LABELS = {
  MAIN: 'Päävalikko',
  TRAINING_SESSIONS: 'Harjoitussessiot',
  COACHES: 'Vetäjät',
  ADMIN: 'Admin',
};

// Tab mapping: Finnish label -> internal key
export const TAB_LABEL_TO_KEY = {
  [TAB_LABELS.MAIN]: TABS.MAIN,
  [TAB_LABELS.TRAINING_SESSIONS]: TABS.TRAINING_SESSION,
  [TAB_LABELS.COACHES]: TABS.COACH,
  [TAB_LABELS.ADMIN]: TABS.ADMIN,
};

// Menu options (legacy - MainMenu now uses config directly)
export const MAIN_MENU_OPTIONS = [
  TAB_LABELS.TRAINING_SESSIONS,
  TAB_LABELS.COACHES,
  TAB_LABELS.ADMIN,
];

// ============================================
// FORM LABELS (Legacy - migrate to locales)
// These are kept for backward compatibility.
// New components should use useTranslation().
// ============================================

export const TRAINEE_SESSION_REGISTRATION_FORM_LABELS = {
  TRAINEE_REGISTRATION_TITLE: 'Harrastajan rekisteröityminen treenisessioon',
  SELECT_TRAINING_GROUP: 'Valitse harjoitusryhmä',
  SELECT_AGE_GROUP: 'Valitse ikäryhmä',
  SESSION_DATE: 'Treenisession päivämäärä:',
  DATE_LABEL: 'Päivämäärä:',
  FULL_NAME: 'Etu- ja sukunimesi:',
  FIRST_NAME: 'Etunimi:',
  LAST_NAME: 'Sukunimi:',
  SUBMIT: 'Ilmoittaudu',
  SUMMARY: 'Yhteenveto:',
  TRAINING_GROUP: 'Harjoitusryhmä:',
  AGE_GROUP: 'Ikäryhmä:',
  AGE: 'Ikä:',
  AGE_PLACEHOLDER: `Syötä ikä (${MINOR_AGE_RANGE.min}-${MINOR_AGE_RANGE.max})`,
  PROCESSING: 'Prosessoidaan...',
  OK: 'OK',
  CANCEL: 'Peruuta',
};

export const COACH_SESSION_REGISTRATION_FORM_LABELS = {
  COACH_REGISTRATION_TITLE: 'Vetäjän rekisteröityminen valmennussessioon',
  SELECT_COACHING_SESSION: 'Valitse ryhmä',
  SESSION_DATE: 'Treenisession päivämäärä:',
  DATE_LABEL: 'Päivämäärä:',
  FULL_NAME: 'Etu- ja sukunimesi:',
  FIRST_NAME: 'Etunimi:',
  LAST_NAME: 'Sukunimi:',
  SUBMIT: 'Ilmoittaudu',
  SUMMARY: 'Yhteenveto:',
  TRAINING_GROUP: 'Harjoitusryhmä:',
  PROCESSING: 'Prosessoidaan...',
  OK: 'OK',
  CANCEL: 'Peruuta',
};

// ============================================
// NOTIFICATION MESSAGES (Legacy - migrate to locales)
// ============================================
export const NOTIFICATION_MESSAGES = {
  REGISTRATION_SUCCESS: 'Rekisteröinti onnistui!',
  REGISTRATION_ERROR: 'Rekisteröinti epäonnistui. Yritä uudelleen.',
  REGISTRATION_EXISTS: 'Rekisteröinti on jo olemassa.',
};

// ============================================
// CONFIG RE-EXPORTS (For convenience)
// ============================================
export { appConfig };
