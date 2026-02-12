/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

/**
 * Configuration Index
 * 
 * Central export point for all configuration modules.
 */

import fiLocale from './locales/fi.json';
import enLocale from './locales/en.json';

export { default as appConfig } from './app.config';
export { 
  darkTheme, 
  lightTheme, 
  sportThemes, 
  getTheme, 
  applyTheme 
} from './theme.config';

export const locales = {
  fi: fiLocale,
  en: enLocale,
};

export { fiLocale, enLocale };
