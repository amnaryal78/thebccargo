// Entry point. Kept tiny on purpose: the stylesheet stays a normal <link> and the app bundle is modulepreloaded.
import './index.css';

import('./bootstrap').catch((err) => {
  console.error('Failed to start the app', err);
  (window as unknown as { __bcShellFail?: () => void }).__bcShellFail?.();
});
