import { describe, expect, it } from 'vitest';
import { builtinItems, declareName, meatItems, searchCatalog, withLearned } from '../src/features/admin/shipments/catalog';

const items = builtinItems();
const top = (q: string, n = 3) => searchCatalog(q, items, n).map((i) => i.name);

describe('item catalog', () => {
  it('has thousands of unique names', () => {
    expect(items.length).toBeGreaterThanOrEqual(2500);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });

  it('never lists the word ghee as a name', () => {
    expect(items.filter((i) => /\bghee\b/i.test(i.name))).toEqual([]);
    expect(meatItems().length).toBeGreaterThan(20);
  });

  it('finds the items from the brief, including common misspellings', () => {
    expect(top('shoes')[0]).toMatch(/shoes/i);
    expect(top('chocolate')[0]).toBe('Chocolate');
    expect(top('choclate')[0]).toBe('Chocolate');
    expect(top('socks')[0]).toBe('Socks');
    expect(top('tshirt')).toContain('T-shirt');
    expect(top('sweeter')).toContain('Sweater');
    expect(top('jacket')[0]).toBe('Jacket');
    expect(top('undergarments')[0]).toBe('Undergarments');
    expect(top('spices')[0]).toBe('Mixed spices');
  });

  it('understands Roman Nepali spellings', () => {
    expect(top('ajwin')).toContain('Carom seeds');
    expect(top('khursani')[0]).toBe('Red chilli');
    expect(top('chiya')[0]).toBe('Tea');
    expect(top('khajur')[0]).toBe('Dates');
  });

  it('suggests Butter when someone types ghee', () => {
    const r = searchCatalog('ghee', items, 3);
    expect(r[0].name).toBe('Butter');
    expect(r[0].hint).toMatch(/not allowed/i);
    expect(declareName('Desi ghee 1 kg')).toBe('Desi Butter 1 kg');
  });

  it('matches several typed words and prefixes', () => {
    expect(top("women's sw")).toContain("Women's Sweater");
    expect(top('mustard oil')[0]).toBe('Mustard oil');
  });

  it('ranks names staff used before first', () => {
    const merged = withLearned(items, [{ name: 'Dhaka topi', uses: 40 }, { name: 'Himalayan salt lamp', unit: 'pcs', uses: 3 }]);
    expect(searchCatalog('salt lamp', merged, 3)[0].name).toBe('Himalayan salt lamp');
    expect(searchCatalog('dhaka', merged, 1)[0].uses).toBe(40);
  });

  it('returns nothing for empty or unknown input without throwing', () => {
    expect(searchCatalog('', items)).toEqual([]);
    expect(searchCatalog('qzxqzxqzx', items)).toEqual([]);
  });
});
