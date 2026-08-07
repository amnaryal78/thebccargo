/**
 * Safe Terser Production JS Minification Script for BC Cargo
 * Minifies JS syntax, strips whitespace & comments, and shortens internal local variables.
 * STRICT: Preserves all HTML IDs, CSS classes, CSS variables, and top-level entrypoints.
 */

const fs = require('fs');
const path = require('path');

let terser;
try {
  terser = require(path.join(__dirname, 'backend', 'node_modules', 'terser'));
} catch {
  terser = require('terser');
}

const jsDir = path.join(__dirname, 'js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

async function build() {
  console.log('⚡ Starting Safe Terser Minification on js/*.js...');

  for (const file of files) {
    const filePath = path.join(jsDir, file);
    const code = fs.readFileSync(filePath, 'utf8');

    const result = await terser.minify(code, {
      compress: {
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true
      },
      mangle: {
        toplevel: false,
        reserved: ['handleTracking', 'verifyPhoneNumber', 'navigateTo', 'handleLogout', 'openArticleModal', 'closeArticleModal']
      },
      format: {
        comments: false
      }
    });

    if (result.error) {
      console.error(`❌ Error minifying ${file}:`, result.error);
      process.exit(1);
    }

    fs.writeFileSync(filePath, result.code, 'utf8');
    console.log(`✅ Minified ${file} (${code.length} bytes -> ${result.code.length} bytes)`);
  }

  console.log('🚀 Build minification completed successfully!');
}

build();
