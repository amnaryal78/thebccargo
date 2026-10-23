/**
 * Single source of truth for public business facts used in metadata and JSON-LD.
 * Imported by the app (LandingPage) and by scripts/prerender.mjs (via jiti), so the static HTML and the
 * hydrated page can never disagree. Only facts the site already shows to visitors belong here: phone, email,
 * address and hours match the Footer, Contact page and llms.txt. Do NOT add geo, postal code, price range,
 * ratings, licence numbers or "since" years until the owner supplies evidence (see docs/OWNER_TODO.md).
 */
export const SITE_URL = 'https://thebccargo.com';

export const BUSINESS = {
  name: 'The BC Cargo & Courier',
  legalName: 'The BC Cargo & Courier Pvt. Ltd.',
  phone: '+977-57-591816',
  mobile: '+977-9855019485',
  email: 'thebccargo@gmail.com',
  street: 'School Road -4',
  city: 'Hetauda',
  country: 'NP',
  hours: { days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
  sameAs: [
    'https://facebook.com/thebccargo',
    'https://instagram.com/thebccargo',
    'https://tiktok.com/@thebccargo',
    'https://youtube.com/@thebccargo'
  ],
  languages: ['English', 'Nepali']
} as const;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** One consolidated entity (LocalBusiness is a subtype of Organization), referenced by @id everywhere else. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ORGANIZATION_ID,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/og-banner.png`,
    description:
      'International courier and cargo service from Hetauda, Nepal to destinations worldwide: parcels, documents and commercial cargo with online tracking.',
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressCountry: BUSINESS.country
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: BUSINESS.hours.days,
      opens: BUSINESS.hours.opens,
      closes: BUSINESS.hours.closes
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS.phone,
      contactType: 'customer service',
      availableLanguage: BUSINESS.languages
    },
    sameAs: BUSINESS.sameAs
  };
}

/** Inline reference for pages other than the home page (Google does not resolve @id across pages). */
export const organizationRef = { '@type': 'Organization', name: BUSINESS.name, url: SITE_URL } as const;

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: BUSINESS.name,
    url: SITE_URL,
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID }
  };
}
