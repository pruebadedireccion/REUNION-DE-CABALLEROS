# Despliegue en GitHub Pages

## Cómo está armado

El sitio es una SPA de Vite + React. Se publica con GitHub Actions, no con la rama
`gh-pages`, para que el build siempre salga del código fuente.

```
push a main
   └─ GitHub Actions
        ├─ npm ci
        ├─ npm run lint     (tsc --noEmit)
        ├─ npm run build    (vite build + postbuild)
        └─ deploy a Pages
```

Workflow: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

## Ruta base

GitHub Pages sirve el sitio en un subdirectorio (`/REUNION-DE-CABALLEROS/`), así que el
build se hace con:

```bash
VITE_BASE_PATH=/REUNION-DE-CABALLEROS/ npm run build
```

El workflow ya lo define. En local no se define y la base queda en `/`.

## Rutas profundas (`/ar`, `/m`, `/p`)

Pages no sabe de rutas de SPA: si alguien entra directo a `/ar`, devuelve 404.
Para eso existe `scripts/postbuild.mjs`, que copia `dist/index.html` a `dist/404.html`.
El navegador recibe el HTML, React lee la URL y renderiza la vista correcta.

Si se agrega una ruta nueva, no hay que tocar nada: el fallback ya la cubre.

## Activar Pages (una sola vez)

```bash
gh api -X POST repos/pruebadedireccion/REUNION-DE-CABALLEROS/pages \
  -f build_type=workflow
```

O desde la web: **Settings → Pages → Source: GitHub Actions**.

## Publicar cambios

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```

Seguir el despliegue:

```bash
gh run list --workflow=deploy.yml --limit 3
gh run watch
```

## Verificar que quedó bien

```bash
curl -I https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/
curl -I https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/ar
```

Ambas deben devolver `200`.

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| 404 en la raíz del sitio | Pages no está activado | Ejecutar el comando de activación de arriba |
| La página carga sin estilos | Build sin `VITE_BASE_PATH` | Revisar el `env` del workflow |
| 404 al entrar directo a `/ar` | Falta `dist/404.html` | Confirmar que `postbuild.mjs` corre después de `vite build` |
| El workflow falla en `npm ci` | `package-lock.json` desactualizado o ausente | `npm install` local, commitear el lock |
| Cambios no aparecen | Caché del navegador | Recargar forzado o abrir en incógnito |

## Dominio propio (opcional)

Si más adelante se usa un dominio de la iglesia:

1. **Settings → Pages → Custom domain**.
2. Crear el registro CNAME en el DNS.
3. Actualizar `site` en [`src/data/qr-targets.json`](../src/data/qr-targets.json).
4. `python scripts/make-qr.py` para regenerar los QR.
