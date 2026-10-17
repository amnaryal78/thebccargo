import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// A refresh must always open the top of the page, not wherever the browser last saved.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
if (!window.location.hash) {
  window.scrollTo(0, 0);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
