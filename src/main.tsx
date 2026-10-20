// Entry point. Kept tiny on purpose: it paints the boot loader first, then starts the app.
// Must stay first: starts reporting real load progress to the #bc-boot overlay.
import './boot/bootLoader';
// Imported here (not in bootstrap) so the stylesheet stays a normal <link> in the HTML head.
import './index.css';

let started = false;
const startApp = () => {
  if (started) return;
  started = true;
  import('./bootstrap').catch((err) => {
    console.error('Failed to start the app', err);
    window.dispatchEvent(new Event('vite:preloadError'));
  });
};

// Let the browser paint the loader before the (heavier) React bundle evaluates, so the first paint is never
// held up behind JavaScript. The bundle is modulepreloaded, so this adds no network wait. The timer is a
// backstop for tabs where animation frames are paused (background tabs, some crawlers).
requestAnimationFrame(() => setTimeout(startApp, 0));
setTimeout(startApp, 200);
