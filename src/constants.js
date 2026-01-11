// Navigation tabs
export const TABS = {
  MAIN: 'main',
  TRAINING_SESSION: 'training_session',
  CAMP: 'camp',
  COACH: 'coach',
  ADMIN: 'admin',
  ABOUT: 'about',
  CONTACT: 'contact',
};

// Tab labels (Finnish)
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

// Session types
export const SESSION_TYPES = {
  FREE_SPARRING: 'Vapaa/sparri',
};

// Age groups
export const AGE_GROUPS = {
  ADULT: '18+ vuotias',
  MINOR: 'alle 18-vuotias',
};

// Form labels (Finnish)
export const FORM_LABELS = {
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
  PROCESSING: 'Prosessoidaan...',
  OK: 'OK',
  CANCEL: 'Peruuta',
};

// Menu options
export const MAIN_MENU_OPTIONS = [
  TAB_LABELS.TRAINING_SESSIONS,
  TAB_LABELS.COACHES,
  TAB_LABELS.ADMIN,
];

// Session options array
export const SESSION_OPTIONS = Object.values(SESSION_TYPES);

// Age group options array
export const AGE_GROUP_OPTIONS = Object.values(AGE_GROUPS);
