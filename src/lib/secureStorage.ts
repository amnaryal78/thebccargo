// Secure LocalStorage Wrapper to prevent token leakage & XSS data harvesting

const OBFUSCATION_SALT = 'BC_CARGO_2026_SECURE_SALT';

function xorEncrypt(text: string, salt: string = OBFUSCATION_SALT): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return btoa(result);
}

function xorDecrypt(encoded: string, salt: string = OBFUSCATION_SALT): string {
  try {
    const text = atob(encoded);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
    }
    return result;
  } catch (e) {
    return encoded;
  }
}

// Custom Supabase Storage adapter that scrubs third-party provider OAuth tokens (ya29...)
export const secureAuthStorage = {
  getItem: (key: string): string | null => {
    try {
      const val = localStorage.getItem(key);
      if (!val) return null;
      return val;
    } catch (e) {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      // Parse token object and scrub sensitive Google OAuth provider_token (ya29...)
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        if ('provider_token' in parsed) {
          delete parsed.provider_token;
        }
        if ('provider_refresh_token' in parsed) {
          delete parsed.provider_refresh_token;
        }
        value = JSON.stringify(parsed);
      }
    } catch (e) {
      // Value is not JSON, write directly
    }

    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Unable to persist auth session to storage:', e);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

// Encrypted Local Data Cache Wrapper for shipments, blogs, inquiries
export const secureDataStorage = {
  getItem: <T>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return fallback;

      // Attempt decrypted parse
      const decrypted = xorDecrypt(stored);
      return JSON.parse(decrypted) as T;
    } catch (e) {
      // Direct JSON fallback for legacy cache
      try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored) as T;
      } catch (err) {}
      return fallback;
    }
  },

  setItem: (key: string, data: any): void => {
    try {
      const json = JSON.stringify(data);
      const encrypted = xorEncrypt(json);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      // Safe fallback if quota exceeded
      console.warn(`SecureStorage error saving ${key}:`, e);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};
