import targets from './qr-targets.json';

/**
 * Fuente única de verdad de las URLs públicas.
 * `scripts/make-qr.py` lee este mismo archivo para generar los QR,
 * así el sitio y los códigos impresos nunca se desincronizan.
 */
export const SITE_URL: string = targets.site.replace(/\/+$/, '');

export function siteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export interface Utilidad {
  id: string;
  path: string;
  nombre: string;
  uso: string;
  publico: string;
  /** Nombre base del archivo en public/qr/ (sin extensión). */
  qr: string;
  url: string;
}

export const UTILIDADES: Utilidad[] = targets.utilities.map((item) => ({
  ...item,
  url: siteUrl(item.path),
}));

export const UTILIDAD_EXPERIENCIA =
  UTILIDADES.find((item) => item.id === 'experiencia') ?? UTILIDADES[0];

export const EXPERIENCIA_URL = UTILIDAD_EXPERIENCIA.url;
