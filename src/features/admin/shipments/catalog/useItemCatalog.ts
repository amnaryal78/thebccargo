import { useEffect, useMemo, useState } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { builtinItems, meatItems, withLearned, type CatalogItem } from './index';

type Learned = Awaited<ReturnType<typeof adminDataService.fetchItemCatalog>>;
let learnedCache: Learned | null = null;
let learnedLoad: Promise<Learned> | null = null;

const loadLearned = (): Promise<Learned> =>
  (learnedLoad ??= adminDataService
    .fetchItemCatalog()
    .then((rows) => (learnedCache = rows))
    .catch(() => {
      // The built-in list still works without the database.
      learnedLoad = null;
      return [] as Learned;
    }));

/** Forget what was loaded, so names learned from a bill just saved show up on the next suggestion. */
export const refreshLearnedItems = (): void => {
  learnedCache = null;
  learnedLoad = null;
};

/** Built-in names plus names staff used before. Names learned earlier rank first. */
export function useItemCatalog(): { goods: CatalogItem[]; meat: CatalogItem[] } {
  const [learned, setLearned] = useState<Learned>(learnedCache ?? []);
  useEffect(() => {
    let live = true;
    void loadLearned().then((rows) => live && setLearned(rows));
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => ({ goods: withLearned(builtinItems(), learned), meat: meatItems() }), [learned]);
}
