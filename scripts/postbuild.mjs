import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexFile = resolve(distDir, 'index.html');

if (!existsSync(indexFile)) {
  console.warn('[postbuild] No se encontró dist/index.html');
  process.exit(0);
}

/**
 * GitHub Pages es estático: no reescribe rutas de SPA.
 * 1) Cada ruta recibe su propio index.html, para que responda 200.
 * 2) 404.html cubre cualquier ruta no listada.
 */
const ROUTES = ['ar', 'm', 'p'];

for (const route of ROUTES) {
  const dir = resolve(distDir, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(indexFile, resolve(dir, 'index.html'));
}

copyFileSync(indexFile, resolve(distDir, '404.html'));

console.log(`[postbuild] rutas generadas: ${ROUTES.map((r) => `/${r}`).join(', ')} + 404.html`);
