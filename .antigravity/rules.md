# Antigravity Workspace Directives

- Always generate modular, clean, and modern Vanilla ES6+ code.
- When splitting HTML files, verify that all external CDN dependencies (GSAP, FontAwesome, Google Fonts) remain intact in the `<head>` of every page.
- Ensure event listeners in `js/main.js` check for element existence (`document.querySelector('...')?`) before attaching handlers to avoid `null` errors on pages where certain elements do not exist.