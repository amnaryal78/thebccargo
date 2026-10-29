import { useEffect } from 'react';
import { markBoot } from './bootLoader';
import type { BootMark } from './bootProgress';

/**
 * Renders nothing; reports a real loading milestone to the boot loader.
 * Place it inside a <Suspense> boundary and it only fires once everything that
 * boundary was waiting on has actually resolved.
 */
export function BootSignal({ mark }: { mark: BootMark }) {
  useEffect(() => {
    markBoot(mark);
  }, [mark]);
  return null;
}
