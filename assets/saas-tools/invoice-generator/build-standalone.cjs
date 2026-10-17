const esbuild = require('esbuild');
const fs = require('fs');

try {
  esbuild.buildSync({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    outfile: 'app.js',
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    loader: {
      '.css': 'empty'
    }
  });

  if (!fs.existsSync('docs')) {
    fs.mkdirSync('docs', { recursive: true });
  }
  fs.copyFileSync('app.js', 'docs/app.js');
  fs.copyFileSync('style.css', 'docs/style.css');
  fs.copyFileSync('index.html', 'docs/index.html');

  if (fs.existsSync('icons')) {
    if (!fs.existsSync('docs/icons')) {
      fs.mkdirSync('docs/icons', { recursive: true });
    }
    fs.cpSync('icons', 'docs/icons', { recursive: true });
  }
  console.log('Successfully bundled to app.js and synced docs/');
} catch (e) {
  console.error('Build error:', e);
}
