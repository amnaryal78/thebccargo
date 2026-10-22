/**
 * Country reference list used by the home globe (flags), the delivery-time panel
 * and the Become a Partner form (country picker + phone dial code).
 * Flag images come from flagcdn.com using the lowercase ISO2 code.
 */
export type Region = 'asia' | 'gulf' | 'europe' | 'americas' | 'africa' | 'oceania';

export interface Country {
  iso2: string;
  iso3: string;
  name: string;
  dial: string;
  region: Region;
}

// [iso2, iso3, name, dial code, region letter]
type Row = [string, string, string, string, 'A' | 'G' | 'E' | 'N' | 'F' | 'O'];

const REGION: Record<Row[4], Region> = {
  A: 'asia',
  G: 'gulf',
  E: 'europe',
  N: 'americas',
  F: 'africa',
  O: 'oceania',
};

const ROWS: Row[] = [
  ['AF', 'AFG', 'Afghanistan', '93', 'A'],
  ['AL', 'ALB', 'Albania', '355', 'E'],
  ['DZ', 'DZA', 'Algeria', '213', 'F'],
  ['AO', 'AGO', 'Angola', '244', 'F'],
  ['AR', 'ARG', 'Argentina', '54', 'N'],
  ['AM', 'ARM', 'Armenia', '374', 'A'],
  ['AU', 'AUS', 'Australia', '61', 'O'],
  ['AT', 'AUT', 'Austria', '43', 'E'],
  ['AZ', 'AZE', 'Azerbaijan', '994', 'A'],
  ['BH', 'BHR', 'Bahrain', '973', 'G'],
  ['BD', 'BGD', 'Bangladesh', '880', 'A'],
  ['BY', 'BLR', 'Belarus', '375', 'E'],
  ['BE', 'BEL', 'Belgium', '32', 'E'],
  ['BZ', 'BLZ', 'Belize', '501', 'N'],
  ['BJ', 'BEN', 'Benin', '229', 'F'],
  ['BT', 'BTN', 'Bhutan', '975', 'A'],
  ['BO', 'BOL', 'Bolivia', '591', 'N'],
  ['BA', 'BIH', 'Bosnia and Herzegovina', '387', 'E'],
  ['BW', 'BWA', 'Botswana', '267', 'F'],
  ['BR', 'BRA', 'Brazil', '55', 'N'],
  ['BN', 'BRN', 'Brunei', '673', 'A'],
  ['BG', 'BGR', 'Bulgaria', '359', 'E'],
  ['BF', 'BFA', 'Burkina Faso', '226', 'F'],
  ['BI', 'BDI', 'Burundi', '257', 'F'],
  ['KH', 'KHM', 'Cambodia', '855', 'A'],
  ['CM', 'CMR', 'Cameroon', '237', 'F'],
  ['CA', 'CAN', 'Canada', '1', 'N'],
  ['CF', 'CAF', 'Central African Republic', '236', 'F'],
  ['TD', 'TCD', 'Chad', '235', 'F'],
  ['CL', 'CHL', 'Chile', '56', 'N'],
  ['CN', 'CHN', 'China', '86', 'A'],
  ['CO', 'COL', 'Colombia', '57', 'N'],
  ['KM', 'COM', 'Comoros', '269', 'F'],
  ['CG', 'COG', 'Congo', '242', 'F'],
  ['CD', 'COD', 'DR Congo', '243', 'F'],
  ['CR', 'CRI', 'Costa Rica', '506', 'N'],
  ['CI', 'CIV', "Côte d'Ivoire", '225', 'F'],
  ['HR', 'HRV', 'Croatia', '385', 'E'],
  ['CU', 'CUB', 'Cuba', '53', 'N'],
  ['CY', 'CYP', 'Cyprus', '357', 'E'],
  ['CZ', 'CZE', 'Czechia', '420', 'E'],
  ['DK', 'DNK', 'Denmark', '45', 'E'],
  ['DJ', 'DJI', 'Djibouti', '253', 'F'],
  ['DO', 'DOM', 'Dominican Republic', '1', 'N'],
  ['EC', 'ECU', 'Ecuador', '593', 'N'],
  ['EG', 'EGY', 'Egypt', '20', 'F'],
  ['SV', 'SLV', 'El Salvador', '503', 'N'],
  ['GQ', 'GNQ', 'Equatorial Guinea', '240', 'F'],
  ['ER', 'ERI', 'Eritrea', '291', 'F'],
  ['EE', 'EST', 'Estonia', '372', 'E'],
  ['SZ', 'SWZ', 'Eswatini', '268', 'F'],
  ['ET', 'ETH', 'Ethiopia', '251', 'F'],
  ['FJ', 'FJI', 'Fiji', '679', 'O'],
  ['FI', 'FIN', 'Finland', '358', 'E'],
  ['FR', 'FRA', 'France', '33', 'E'],
  ['GA', 'GAB', 'Gabon', '241', 'F'],
  ['GM', 'GMB', 'Gambia', '220', 'F'],
  ['GE', 'GEO', 'Georgia', '995', 'A'],
  ['DE', 'DEU', 'Germany', '49', 'E'],
  ['GH', 'GHA', 'Ghana', '233', 'F'],
  ['GR', 'GRC', 'Greece', '30', 'E'],
  ['GL', 'GRL', 'Greenland', '299', 'N'],
  ['GT', 'GTM', 'Guatemala', '502', 'N'],
  ['GN', 'GIN', 'Guinea', '224', 'F'],
  ['GW', 'GNB', 'Guinea-Bissau', '245', 'F'],
  ['GY', 'GUY', 'Guyana', '592', 'N'],
  ['HT', 'HTI', 'Haiti', '509', 'N'],
  ['HN', 'HND', 'Honduras', '504', 'N'],
  ['HK', 'HKG', 'Hong Kong', '852', 'A'],
  ['HU', 'HUN', 'Hungary', '36', 'E'],
  ['IS', 'ISL', 'Iceland', '354', 'E'],
  ['IN', 'IND', 'India', '91', 'A'],
  ['ID', 'IDN', 'Indonesia', '62', 'A'],
  ['IR', 'IRN', 'Iran', '98', 'A'],
  ['IQ', 'IRQ', 'Iraq', '964', 'G'],
  ['IE', 'IRL', 'Ireland', '353', 'E'],
  ['IL', 'ISR', 'Israel', '972', 'A'],
  ['IT', 'ITA', 'Italy', '39', 'E'],
  ['JM', 'JAM', 'Jamaica', '1', 'N'],
  ['JP', 'JPN', 'Japan', '81', 'A'],
  ['JO', 'JOR', 'Jordan', '962', 'G'],
  ['KZ', 'KAZ', 'Kazakhstan', '7', 'A'],
  ['KE', 'KEN', 'Kenya', '254', 'F'],
  ['XK', 'XKX', 'Kosovo', '383', 'E'],
  ['KW', 'KWT', 'Kuwait', '965', 'G'],
  ['KG', 'KGZ', 'Kyrgyzstan', '996', 'A'],
  ['LA', 'LAO', 'Laos', '856', 'A'],
  ['LV', 'LVA', 'Latvia', '371', 'E'],
  ['LB', 'LBN', 'Lebanon', '961', 'G'],
  ['LS', 'LSO', 'Lesotho', '266', 'F'],
  ['LR', 'LBR', 'Liberia', '231', 'F'],
  ['LY', 'LBY', 'Libya', '218', 'F'],
  ['LT', 'LTU', 'Lithuania', '370', 'E'],
  ['LU', 'LUX', 'Luxembourg', '352', 'E'],
  ['MG', 'MDG', 'Madagascar', '261', 'F'],
  ['MW', 'MWI', 'Malawi', '265', 'F'],
  ['MY', 'MYS', 'Malaysia', '60', 'A'],
  ['ML', 'MLI', 'Mali', '223', 'F'],
  ['MT', 'MLT', 'Malta', '356', 'E'],
  ['MR', 'MRT', 'Mauritania', '222', 'F'],
  ['MX', 'MEX', 'Mexico', '52', 'N'],
  ['MD', 'MDA', 'Moldova', '373', 'E'],
  ['MC', 'MCO', 'Monaco', '377', 'E'],
  ['MN', 'MNG', 'Mongolia', '976', 'A'],
  ['ME', 'MNE', 'Montenegro', '382', 'E'],
  ['MA', 'MAR', 'Morocco', '212', 'F'],
  ['MZ', 'MOZ', 'Mozambique', '258', 'F'],
  ['MM', 'MMR', 'Myanmar', '95', 'A'],
  ['NA', 'NAM', 'Namibia', '264', 'F'],
  ['NP', 'NPL', 'Nepal', '977', 'A'],
  ['NL', 'NLD', 'Netherlands', '31', 'E'],
  ['NC', 'NCL', 'New Caledonia', '687', 'O'],
  ['NZ', 'NZL', 'New Zealand', '64', 'O'],
  ['NI', 'NIC', 'Nicaragua', '505', 'N'],
  ['NE', 'NER', 'Niger', '227', 'F'],
  ['NG', 'NGA', 'Nigeria', '234', 'F'],
  ['KP', 'PRK', 'North Korea', '850', 'A'],
  ['MK', 'MKD', 'North Macedonia', '389', 'E'],
  ['NO', 'NOR', 'Norway', '47', 'E'],
  ['OM', 'OMN', 'Oman', '968', 'G'],
  ['PK', 'PAK', 'Pakistan', '92', 'A'],
  ['PS', 'PSE', 'Palestine', '970', 'G'],
  ['PA', 'PAN', 'Panama', '507', 'N'],
  ['PG', 'PNG', 'Papua New Guinea', '675', 'O'],
  ['PY', 'PRY', 'Paraguay', '595', 'N'],
  ['PE', 'PER', 'Peru', '51', 'N'],
  ['PH', 'PHL', 'Philippines', '63', 'A'],
  ['PL', 'POL', 'Poland', '48', 'E'],
  ['PT', 'PRT', 'Portugal', '351', 'E'],
  ['QA', 'QAT', 'Qatar', '974', 'G'],
  ['RO', 'ROU', 'Romania', '40', 'E'],
  ['RU', 'RUS', 'Russia', '7', 'E'],
  ['RW', 'RWA', 'Rwanda', '250', 'F'],
  ['SA', 'SAU', 'Saudi Arabia', '966', 'G'],
  ['SN', 'SEN', 'Senegal', '221', 'F'],
  ['RS', 'SRB', 'Serbia', '381', 'E'],
  ['SL', 'SLE', 'Sierra Leone', '232', 'F'],
  ['SG', 'SGP', 'Singapore', '65', 'A'],
  ['SK', 'SVK', 'Slovakia', '421', 'E'],
  ['SI', 'SVN', 'Slovenia', '386', 'E'],
  ['SB', 'SLB', 'Solomon Islands', '677', 'O'],
  ['SO', 'SOM', 'Somalia', '252', 'F'],
  ['ZA', 'ZAF', 'South Africa', '27', 'F'],
  ['KR', 'KOR', 'South Korea', '82', 'A'],
  ['SS', 'SSD', 'South Sudan', '211', 'F'],
  ['ES', 'ESP', 'Spain', '34', 'E'],
  ['LK', 'LKA', 'Sri Lanka', '94', 'A'],
  ['SD', 'SDN', 'Sudan', '249', 'F'],
  ['SR', 'SUR', 'Suriname', '597', 'N'],
  ['SE', 'SWE', 'Sweden', '46', 'E'],
  ['CH', 'CHE', 'Switzerland', '41', 'E'],
  ['SY', 'SYR', 'Syria', '963', 'G'],
  ['TW', 'TWN', 'Taiwan', '886', 'A'],
  ['TJ', 'TJK', 'Tajikistan', '992', 'A'],
  ['TZ', 'TZA', 'Tanzania', '255', 'F'],
  ['TH', 'THA', 'Thailand', '66', 'A'],
  ['TL', 'TLS', 'Timor-Leste', '670', 'A'],
  ['TG', 'TGO', 'Togo', '228', 'F'],
  ['TT', 'TTO', 'Trinidad and Tobago', '1', 'N'],
  ['TN', 'TUN', 'Tunisia', '216', 'F'],
  ['TR', 'TUR', 'Turkey', '90', 'E'],
  ['TM', 'TKM', 'Turkmenistan', '993', 'A'],
  ['UG', 'UGA', 'Uganda', '256', 'F'],
  ['UA', 'UKR', 'Ukraine', '380', 'E'],
  ['AE', 'ARE', 'United Arab Emirates', '971', 'G'],
  ['GB', 'GBR', 'United Kingdom', '44', 'E'],
  ['US', 'USA', 'United States', '1', 'N'],
  ['UY', 'URY', 'Uruguay', '598', 'N'],
  ['UZ', 'UZB', 'Uzbekistan', '998', 'A'],
  ['VU', 'VUT', 'Vanuatu', '678', 'O'],
  ['VE', 'VEN', 'Venezuela', '58', 'N'],
  ['VN', 'VNM', 'Vietnam', '84', 'A'],
  ['YE', 'YEM', 'Yemen', '967', 'G'],
  ['ZM', 'ZMB', 'Zambia', '260', 'F'],
  ['ZW', 'ZWE', 'Zimbabwe', '263', 'F'],
];

export const COUNTRIES: Country[] = ROWS.map(([iso2, iso3, name, dial, r]) => ({
  iso2,
  iso3,
  name,
  dial,
  region: REGION[r],
}));

export const COUNTRY_BY_ISO3: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.iso3, c])
);

export const COUNTRY_BY_ISO2: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.iso2, c])
);

/** Flags self-hosted in /public/flags (SVG, any size): they never depend on a third-party image host. */
const LOCAL_FLAGS = new Set(['np', 'kr', 'jp', 'hk', 'ph', 'tw', 'my', 'ae', 'sa', 'qa', 'kw', 'bh', 'gb', 'au', 'nz', 'us', 'ca', 'mt', 'cy', 'at', 'de', 'lu', 'nl', 'cz', 'dk', 'fr', 'mc', 'hu', 'it', 'ie', 'pl', 'sk', 'si', 'es', 'se', 'pt', 'ro', 'gr', 'bg', 'hr', 'ee', 'fi', 'lt', 'lv']);

export const flagUrl = (iso2: string, width: 20 | 40 | 80 = 40): string => {
  const code = iso2.toLowerCase();
  if (LOCAL_FLAGS.has(code)) return `/flags/${code}.svg`;
  return `https://flagcdn.com/w${width}/${code}.png`;
};

/** Plain-language delivery estimate (business days) when no specific tariff row exists. */
const REGION_DELIVERY: Record<Region, { days: string; mode: string }> = {
  gulf: { days: '2–4 days', mode: 'Air' },
  asia: { days: '3–5 days', mode: 'Air' },
  europe: { days: '4–6 days', mode: 'Air' },
  oceania: { days: '4–6 days', mode: 'Air' },
  americas: { days: '4–7 days', mode: 'Air' },
  africa: { days: '5–8 days', mode: 'Air' },
};

export const deliveryEstimate = (region: Region) => REGION_DELIVERY[region];
