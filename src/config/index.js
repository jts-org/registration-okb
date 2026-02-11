/**
 * Configuration Index
 * 
 * Central export point for all configuration modules.
 */

export { default as appConfig } from './app.config';
export { 
  darkTheme, 
  lightTheme, 
  sportThemes, 
  getTheme, 
  applyTheme 
} from './theme.config';

// Locale imports
import fiLocale from './locales/fi.json';
import enLocale from './locales/en.json';

export const locales = {
  fi: fiLocale,
  en: enLocale,
};

export { fiLocale, enLocale };
