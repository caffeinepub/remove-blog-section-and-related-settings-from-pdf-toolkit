// Language storage helpers for localStorage persistence

const LANGUAGE_KEY = 'pdf-toolkit-language';
const DEFAULT_LANGUAGE = 'en';

export function getStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && isValidLanguage(stored)) {
      return stored;
    }
  } catch (error) {
    console.error('Failed to read language from localStorage:', error);
  }
  return DEFAULT_LANGUAGE;
}

export function setStoredLanguage(language: string): void {
  try {
    if (isValidLanguage(language)) {
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  } catch (error) {
    console.error('Failed to save language to localStorage:', error);
  }
}

function isValidLanguage(lang: string): boolean {
  // Add more languages as they are added to translations
  return ['en', 'es'].includes(lang);
}

// Non-React accessor for current language (for use in utilities/toasts)
export function getCurrentLanguage(): string {
  return getStoredLanguage();
}
