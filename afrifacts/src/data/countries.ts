/**
 * Names and flags for country codes.
 *
 * This is a lookup, not a list of what the app offers. Which countries
 * appear in the picker is decided by the corpus — see `getCountries()` —
 * and this only answers "what do we call NG, and what flag is that". The
 * two are separate on purpose: adding a country is a content decision made
 * in the studio, and it should not need an app release.
 *
 * All 55 African Union members are here so that the day a Ghanaian fact is
 * approved, the picker says "Ghana 🇬🇭" rather than "GH 🌍".
 */

/**
 * The flag emoji for an ISO 3166-1 alpha-2 code.
 *
 * Derived rather than stored: a flag emoji is just its two letters as
 * regional indicator symbols, so a table of them would be 55 rows of
 * something arithmetic already knows.
 */
export function flagFor(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🌍';
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => base + letter.charCodeAt(0) - 65),
  );
}

const NAMES: Record<string, string> = {
  DZ: 'Algeria',
  AO: 'Angola',
  BJ: 'Benin',
  BW: 'Botswana',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  CV: 'Cabo Verde',
  CM: 'Cameroon',
  CF: 'Central African Republic',
  TD: 'Chad',
  KM: 'Comoros',
  CG: 'Congo',
  CD: 'DR Congo',
  CI: "Côte d'Ivoire",
  DJ: 'Djibouti',
  EG: 'Egypt',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  SZ: 'Eswatini',
  ET: 'Ethiopia',
  GA: 'Gabon',
  GM: 'Gambia',
  GH: 'Ghana',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  KE: 'Kenya',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  MG: 'Madagascar',
  MW: 'Malawi',
  ML: 'Mali',
  MR: 'Mauritania',
  MU: 'Mauritius',
  MA: 'Morocco',
  MZ: 'Mozambique',
  NA: 'Namibia',
  NE: 'Niger',
  NG: 'Nigeria',
  RW: 'Rwanda',
  ST: 'São Tomé and Príncipe',
  SN: 'Senegal',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SO: 'Somalia',
  ZA: 'South Africa',
  SS: 'South Sudan',
  SD: 'Sudan',
  TZ: 'Tanzania',
  TG: 'Togo',
  TN: 'Tunisia',
  UG: 'Uganda',
  EH: 'Western Sahara',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};

/** The pan-African code. Not a country, and always pinned to the top. */
export const ALL_AFRICA = 'AFR';

/**
 * A display name for a code.
 *
 * Falls back to the code itself rather than to a placeholder, so a fact
 * filed under something unexpected surfaces as a visible oddity in the
 * picker instead of silently reading "Unknown".
 */
export function nameFor(code: string): string {
  if (code === ALL_AFRICA) return 'Africa · all countries';
  return NAMES[code.toUpperCase()] ?? code;
}

/** Every code we can name, for offering countries that have no facts yet. */
export function knownCountryCodes(): string[] {
  return Object.keys(NAMES);
}
