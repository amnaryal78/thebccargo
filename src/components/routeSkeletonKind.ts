export type RouteSkeletonKind = 'page' | 'cards' | 'article' | 'form' | 'admin';

/** Which skeleton shape looks most like the page at this path. */
export function skeletonKindForPath(pathname: string): RouteSkeletonKind {
  const p = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (p === '/admin/login') return 'form';
  if (p.startsWith('/admin')) return 'admin';
  if (/^\/(blogs|services|careers)\/.+/.test(p) || p.startsWith('/send-parcel-nepal-to-')) return 'article';
  if (/^\/(blogs|services|careers)$/.test(p)) return 'cards';
  if (/^\/(book|track|contact|login|become-a-partner|profile|messages)$/.test(p)) return 'form';
  return 'page';
}
