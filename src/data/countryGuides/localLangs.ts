import type { LocalLangCode, LocalPack } from './types';

/**
 * Which guides have a local-language version, and which pack holds it.
 * Small and static so list pages know about the option without loading any translation.
 */
export const LOCAL_LANG_OF: Record<string, { code: LocalLangCode; label: string }> = {
  'nepal-to-south-korea': { code: 'ko', label: '한국어' },
  'nepal-to-japan': { code: 'ja', label: '日本語' },
  'nepal-to-taiwan': { code: 'zh', label: '繁體中文' },
  'nepal-to-hong-kong': { code: 'zh', label: '繁體中文' },
  'nepal-to-malaysia': { code: 'ms', label: 'Bahasa Melayu' },
  'nepal-to-uae': { code: 'ar', label: 'العربية' },
  'nepal-to-saudi-arabia': { code: 'ar', label: 'العربية' },
  'nepal-to-qatar': { code: 'ar', label: 'العربية' },
  'nepal-to-kuwait': { code: 'ar', label: 'العربية' },
  'nepal-to-bahrain': { code: 'ar', label: 'العربية' },
  'nepal-to-germany': { code: 'de', label: 'Deutsch' },
  'nepal-to-austria': { code: 'de', label: 'Deutsch' },
};

/** Each pack is its own chunk, fetched only when a visitor picks that language. */
export const loadLocalPack = (code: LocalLangCode): Promise<LocalPack> =>
  ({
    ko: () => import('./local/ko'),
    ja: () => import('./local/ja'),
    zh: () => import('./local/zh'),
    ar: () => import('./local/ar'),
    ms: () => import('./local/ms'),
    de: () => import('./local/de'),
  })[code]().then((m) => m.default);
