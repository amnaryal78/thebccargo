/**
 * Loads the country guide content (TypeScript) for the Node build scripts, so the sitemap and
 * prerendered pages always match the guides the app renders. jiti is already installed with
 * Tailwind; it transpiles the .ts files on the fly.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { createJiti } from 'jiti';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function loadCountryGuides() {
  const jiti = createJiti(import.meta.url);
  const mod = await jiti.import(path.join(ROOT, 'src/data/countryGuides/index.ts'));
  return mod.COUNTRY_GUIDES;
}
