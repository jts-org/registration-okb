/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import appConfig from '../config/app.config';
import { getTheme, applyTheme } from '../config/theme.config';
import { locales } from '../config';

// ============================================
// APP CONFIG CONTEXT
// ============================================

const AppConfigContext = createContext(null);

export function AppConfigProvider({ children, customConfig = {} }) {
  // Merge custom config with default config
  const [config] = useState(() => deepMerge(appConfig, customConfig));

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
}

// ============================================
// THEME CONTEXT
// ============================================

const ThemeContext = createContext(null);

export function ThemeProvider({ children, themeName }) {
  const config = useContext(AppConfigContext);
  const initialTheme = themeName || config?.theme?.preset || 'dark';
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  useEffect(() => {
    const theme = getTheme(currentTheme);
    applyTheme(theme);
  }, [currentTheme]);

  const setTheme = useCallback((name) => {
    setCurrentTheme(name);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// ============================================
// LOCALE CONTEXT (i18n)
// ============================================

const LocaleContext = createContext(null);

export function LocaleProvider({ children, defaultLocale }) {
  const config = useContext(AppConfigContext);
  const initialLocale = defaultLocale || config?.localization?.defaultLocale || 'fi';
  const [locale, setLocale] = useState(initialLocale);
  const [translations, setTranslations] = useState(locales[initialLocale] || locales.fi);

  useEffect(() => {
    const newTranslations = locales[locale] || locales.fi;
    setTranslations(newTranslations);
  }, [locale]);

  // Translation function with nested key support (e.g., 'navigation.mainMenu')
  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }
    }
    
    // Replace parameters in string (e.g., {name} -> actual value)
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (_, param) => params[param] || `{${param}}`);
    }
    
    return value;
  }, [translations]);

  const changeLocale = useCallback((newLocale) => {
    if (locales[newLocale]) {
      setLocale(newLocale);
    } else {
      console.warn(`Locale '${newLocale}' not found. Available locales: ${Object.keys(locales).join(', ')}`);
    }
  }, []);

  const availableLocales = Object.keys(locales);

  return (
    <LocaleContext.Provider value={{ locale, t, changeLocale, availableLocales }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

// Shorthand hook for just the translation function
export function useTranslation() {
  const { t } = useLocale();
  return t;
}

// ============================================
// FEATURE FLAGS CONTEXT
// ============================================

const FeatureFlagsContext = createContext(null);

export function FeatureFlagsProvider({ children, overrides = {} }) {
  const config = useContext(AppConfigContext);
  const features = useMemo(() => ({ ...config?.features, ...overrides }), [config?.features, overrides]);

  const isEnabled = useCallback((featureName) => {
    return features[featureName] === true;
  }, [features]);

  return (
    <FeatureFlagsContext.Provider value={{ features, isEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}

// Convenience hook to check single feature
export function useFeature(featureName) {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(featureName);
}

// ============================================
// COMBINED PROVIDERS
// ============================================

export function ConfigurationProvider({ children, config = {}, theme, locale }) {
  return (
    <AppConfigProvider customConfig={config}>
      <ThemeProvider themeName={theme}>
        <LocaleProvider defaultLocale={locale}>
          <FeatureFlagsProvider>
            {children}
          </FeatureFlagsProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AppConfigProvider>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

const ConfigContextExports = {
  AppConfigProvider,
  useAppConfig,
  ThemeProvider,
  useTheme,
  LocaleProvider,
  useLocale,
  useTranslation,
  FeatureFlagsProvider,
  useFeatureFlags,
  useFeature,
  ConfigurationProvider,
};
export default ConfigContextExports;
