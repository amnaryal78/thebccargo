/**
 * Loads app data modules (TypeScript) for the Node build scripts through jiti, so prerendered metadata is
 * generated from the same source as the running app instead of being copied by hand.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { createJiti } from 'jiti';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jiti = createJiti(import.meta.url);

export const loadBusiness = () => jiti.import(path.join(ROOT, 'src/data/business.ts'));
export const loadPageMeta = () => jiti.import(path.join(ROOT, 'src/data/pageMeta.ts'));
export async function loadServices() {
  const mod = await jiti.import(path.join(ROOT, 'src/services/servicesData.ts'));
  return mod.SERVICES_CATALOG;
}
