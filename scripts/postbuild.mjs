import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexFile = resolve(distDir, 'index.html');
const notFoundFile = resolve(distDir, '404.html');

if (!existsSync(indexFile)) {
  console.warn('[postbuild] No se encontró dist/index.html');
  process.exit(0);
}

// GitHub Pages no reescribe rutas SPA: 404.html sirve la app en /ar, /m, /panel...
copyFileSync(indexFile, notFoundFile);
console.log('[postbuild] dist/404.html generado');
