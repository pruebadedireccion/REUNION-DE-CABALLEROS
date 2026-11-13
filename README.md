# Detrás de la apariencia

Experiencia interactiva para la **Reunión de Caballeros — Iglesia El Remanente**.

La portada muestra únicamente el título. Al entrar, el hombre aparece en plano general dentro
de la habitación y la vista recorre los 360° sola, en loop. También se puede girar el celular
para mirar alrededor, o arrastrar con el dedo.

**Sitio en vivo:** <https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/>

---

## Enlaces y códigos QR

Cada utilidad del sitio tiene su propio código. El de la experiencia es el único que va impreso.

| QR | Utilidad | Ruta | Para quién | Enlace |
|:--:|----------|------|------------|--------|
| <img src="public/qr/qr-experiencia.png" width="140" alt="QR de la experiencia"> | **La experiencia** | `/ar` | Todos los asistentes · **uso principal** | [Abrir](https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/ar) |
| <img src="public/qr/qr-inicio.png" width="140" alt="QR de la portada"> | **Portada** | `/` | Todos los asistentes | [Abrir](https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/) |
| <img src="public/qr/qr-logistica.png" width="140" alt="QR del panel de logística"> | **Panel de logística** | `/m` | Equipo de logística | [Abrir](https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/m) |
| <img src="public/qr/qr-predicador.png" width="140" alt="QR de la vista del predicador"> | **Vista del predicador** | `/p` | Pastor / predicador | [Abrir](https://pruebadedireccion.github.io/REUNION-DE-CABALLEROS/p) |

Archivos listos para imprenta en [`public/qr/`](public/qr) — PNG de ~2000 px y SVG vectorial
de cada uno.

> Los QR se generan desde [`src/data/qr-targets.json`](src/data/qr-targets.json), el mismo archivo
> que lee la app. Una sola fuente de verdad: si cambia el dominio, se regeneran y ya.

---

## Cómo funciona la experiencia

| Elemento | Comportamiento |
|---|---|
| Portada | Solo el título `Detrás de la apariencia` y una línea. Toca para entrar (o Enter). |
| Personaje | 8 vistas fotorrealistas a 45°, recortadas del fondo de estudio y compuestas sobre una escena oscura con luz cálida y sombra de contacto. |
| Paneo automático | Vuelta completa cada ~14 s, con fundido corto entre vistas. Arranca solo. |
| Giroscopio | Botón **Giro**: el personaje sigue el movimiento del teléfono. En iOS pide permiso (obligatorio). |
| Arrastre | Girar con el dedo; al soltar hay inercia y el paneo automático vuelve a los ~3,8 s. |
| Salir | Abre el cierre de la prédica ("No está bien…"). |

---

## Estructura del repositorio

```
.
├── .github/workflows/deploy.yml   Despliegue automático a GitHub Pages
├── assets/source/                 Turnaround original de referencia (no se publica)
├── docs/                          Documentación operativa
│   ├── DESPLIEGUE.md              Cómo publicar y actualizar el sitio
│   ├── LOGISTICA.md               Guía para el equipo el día del evento
│   └── QR.md                      Generar y reemplazar códigos QR
├── public/
│   ├── frames/                    Las 8 vistas del personaje (v00…v07.jpg)
│   └── qr/                        QR en PNG + SVG, uno por utilidad
├── scripts/
│   ├── make-qr.py                 Generador de QR (lee qr-targets.json)
│   └── postbuild.mjs              Copia index.html → 404.html (rutas SPA en Pages)
├── src/
│   ├── components/
│   │   ├── CharacterTurntable.tsx Motor 2.5D: recorte, fundido, paneo, giroscopio
│   │   └── QrCodeBlock.tsx        Render de QR en el navegador
│   ├── data/
│   │   ├── qr-targets.json        URLs públicas y nombres de los QR (fuente única)
│   │   ├── links.ts               Deriva SITE_URL y UTILIDADES del JSON
│   │   └── experienceConfig.ts    Título y contenido de la prédica
│   ├── lib/motion.ts              Permisos de giroscopio (iOS)
│   ├── views/                     Portada, experiencia, QR y predicador
│   └── index.css                  Animaciones y atmósfera cinematográfica
├── index.html
└── vite.config.ts
```

---

## Desarrollo local

Requiere Node 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # chequeo de tipos
npm run build      # build de producción en dist/
```

Para probar con la misma ruta base de Pages:

```bash
VITE_BASE_PATH=/REUNION-DE-CABALLEROS/ npm run build
npm run preview
```

En Windows PowerShell:

```powershell
$env:VITE_BASE_PATH="/REUNION-DE-CABALLEROS/"; npm run build
```

---

## Despliegue

Cada `push` a `main` dispara [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
chequeo de tipos → build → publicación en GitHub Pages.

Detalle completo en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md).

---

## Cambiar el personaje

1. Reemplazar `public/frames/v00.jpg` … `v07.jpg` manteniendo el orden de giro
   (0° = frente, 45° = frente derecha, … 315° = frente izquierda).
2. Mismo encuadre y misma altura de figura en las 8 imágenes.
3. Fondo plano y uniforme: el motor lo recorta automáticamente.
4. Listo. No hace falta tocar código.

Recomendado: 700 × 1500 px o más por vista, para que se vea nítido en pantalla completa.

---

## Documentación

- [Guía de logística](docs/LOGISTICA.md) — qué escanear, cómo imprimir, qué hacer si falla.
- [Despliegue](docs/DESPLIEGUE.md) — Pages, workflow, ruta base y problemas comunes.
- [Códigos QR](docs/QR.md) — generarlos, cambiarlos y verificarlos.
