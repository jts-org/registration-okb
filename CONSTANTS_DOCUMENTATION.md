# Constants Documentation

This file documents the structure and usage of `src/constants.js`.

## Purpose

The constants file centralizes all configuration values, labels, and hardcoded strings used throughout the application. This provides:

- **Single source of truth** for all user-facing text
- **Easy maintenance** - change labels in one place
- **i18n readiness** - prepared for future internationalization
- **Type safety** - can be easily typed with TypeScript

## Constants Reference

### TABS
Internal navigation keys used by the application.

```javascript
TABS = {
  MAIN: 'main',
  TRAINING_SESSION: 'training_session',
  CAMP: 'camp',
  COACH: 'coach',
  ADMIN: 'admin',
  ABOUT: 'about',
  CONTACT: 'contact',
}
```

### TAB_LABELS
User-facing labels for navigation tabs (Finnish).

```javascript
TAB_LABELS = {
  MAIN: 'Päävalikko',
  TRAINING_SESSIONS: 'Harjoitussessiot',
  COACHES: 'Vetäjät',
  ADMIN: 'Admin',
}
```

### TAB_LABEL_TO_KEY
Mapping from Finnish labels to internal tab keys. Used for navigation.

```javascript
TAB_LABEL_TO_KEY = {
  'Päävalikko': 'main',
  'Harjoitussessiot': 'training_session',
  'Vetäjät': 'coach',
  'Admin': 'admin',
}
```

### SESSION_TYPES
Types of training sessions available.

```javascript
SESSION_TYPES = {
  ADVANCED_GROUP: 'Jatkoryhmä',
  FREE_SPARRING: 'Vapaa/sparri',
}
```

### SESSION_OPTIONS
Array of session type values for UI rendering.

```javascript
SESSION_OPTIONS = ['Jatkoryhmä', 'Vapaa/sparri']
```

### AGE_GROUPS
Age group categories for registration.

```javascript
AGE_GROUPS = {
  ADULT: '18+ vuotias',
  MINOR: 'alle 18-vuotias',
}
```

### AGE_GROUP_OPTIONS
Array of age group values for UI rendering.

```javascript
AGE_GROUP_OPTIONS = ['18+ vuotias', 'alle 18-vuotias']
```

### FORM_LABELS
All user-facing form labels and UI text.

```javascript
FORM_LABELS = {
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
  CANCEL: 'Cancel',
}
```

### MAIN_MENU_OPTIONS
Array of options displayed in the main menu.

```javascript
MAIN_MENU_OPTIONS = ['Harjoitussessiot', 'Vetäjät', 'Admin']
```

## Usage Examples

### Importing Constants

```javascript
// Import specific constants
import { TABS, FORM_LABELS } from '../constants';

// Use in component
const activeTab = TABS.MAIN;
const title = FORM_LABELS.TRAINEE_REGISTRATION_TITLE;
```

### Navigation

```javascript
import { TABS, TAB_LABEL_TO_KEY } from '../constants';

// Map user selection to internal key
const onTabChange = (label) => {
  const key = TAB_LABEL_TO_KEY[label] || label;
  setActiveTab(key);
};

// Check current tab
if (activeTab === TABS.MAIN) {
  // Show main menu
}
```

### Forms

```javascript
import { SESSION_OPTIONS, AGE_GROUP_OPTIONS, FORM_LABELS } from '../constants';

// Use in JSX
<h2>{FORM_LABELS.TRAINEE_REGISTRATION_TITLE}</h2>
<ToggleButtons buttonsGroup={SESSION_OPTIONS} />
<ToggleButtons buttonsGroup={AGE_GROUP_OPTIONS} />
<label>{FORM_LABELS.FIRST_NAME}</label>
```

## Adding New Constants

To add new constants:

1. Add to appropriate section in `src/constants.js`
2. Export the constant
3. Import and use in components
4. Update this documentation

Example:
```javascript
// In src/constants.js
export const NEW_FEATURE_LABELS = {
  TITLE: 'New Feature',
  DESCRIPTION: 'Feature description',
};

// In component
import { NEW_FEATURE_LABELS } from '../constants';
<h1>{NEW_FEATURE_LABELS.TITLE}</h1>
```

## Internationalization (i18n)

To add multi-language support in the future:

1. Install i18n library (e.g., `react-i18next`)
2. Convert constants to i18n keys
3. Create translation files for each language
4. Replace direct string usage with i18n function calls

Example structure:
```javascript
// constants.js - i18n keys
export const FORM_LABEL_KEYS = {
  FIRST_NAME: 'form.firstName',
  LAST_NAME: 'form.lastName',
};

// en.json
{
  "form": {
    "firstName": "First Name:",
    "lastName": "Last Name:"
  }
}

// fi.json
{
  "form": {
    "firstName": "Etunimi:",
    "lastName": "Sukunimi:"
  }
}
```

## Best Practices

1. **Always use constants** - Never hardcode strings in components
2. **Organize logically** - Group related constants together
3. **Use descriptive names** - Constant names should be clear and unambiguous
4. **Document changes** - Update this file when adding new constants
5. **Keep it flat** - Avoid deep nesting in constant objects
6. **Use UPPER_CASE** - For constant names (convention)
7. **Export explicitly** - Always export constants that will be used elsewhere
