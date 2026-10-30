import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Skeleton, SkeletonGroup, SKELETON_DELAY_MS } from '../design/primitives/Skeleton';
import { skeletonKindForPath } from './routeSkeletonKind';

const Heading = () => (
  <div className="space-y-3 max-w-2xl">
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-5 w-full" />
  </div>
);

/** Suspense fallback while a route's code downloads, shaped like the page that is coming. */
export function RouteSkeleton() {
  const { pathname } = useLocation();
  const kind = skeletonKindForPath(pathname);
  // First load: the #bc-shell timer started at navigation, so continue it rather than restarting it.
  const [delayMs] = useState(() => (document.getElementById('bc-shell') ? Math.max(0, 500 - performance.now()) : SKELETON_DELAY_MS));

  if (kind === 'admin') {
    return (
      <SkeletonGroup label="Loading admin" delayMs={delayMs} className="min-h-screen flex">
        <div className="hidden lg:block w-60 shrink-0 p-4 space-y-3 border-r border-[var(--line)]">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
        <div className="flex-1 min-w-0 p-4 sm:p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </SkeletonGroup>
    );
  }

  return (
    <SkeletonGroup label="Loading page" delayMs={delayMs} className="min-h-[70vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {kind === 'cards' && (
        <div className="max-w-7xl mx-auto space-y-10">
          <Heading />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
          </div>
        </div>
      )}
      {kind === 'article' && (
        <div className="max-w-3xl mx-auto space-y-5">
          <Heading />
          <Skeleton className="h-56 sm:h-72 rounded-xl" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />)}
        </div>
      )}
      {kind === 'form' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Heading />
          <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] space-y-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-11 w-full" />)}
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      )}
      {kind === 'page' && (
        <div className="max-w-6xl mx-auto space-y-8">
          <Heading />
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        </div>
      )}
    </SkeletonGroup>
  );
}
