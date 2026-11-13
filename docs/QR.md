# Códigos QR

Los cuatro QR del proyecto se generan desde un solo archivo:
[`src/data/qr-targets.json`](../src/data/qr-targets.json).

## Generar / regenerar

```bash
python scripts/make-qr.py
```

Requiere Python 3 y `segno`:

```bash
pip install segno
```

Salida en `public/qr/`:

| Archivo | Destino | Uso |
|---|---|---|
| `qr-experiencia.png` / `.svg` | `/ar` | **Principal.** Afiche, pantalla y mesas. |
| `qr-inicio.png` / `.svg` | `/` | Entrada general al sitio. |
| `qr-logistica.png` / `.svg` | `/m` | Equipo de logística. |
| `qr-predicador.png` / `.svg` | `/p` | Pastor / predicador. |

Cada uno sale en PNG de ~2000 px (impresión) y SVG (imprenta o pantalla grande).

## Cambiar un destino

1. Editar la URL o la ruta en `src/data/qr-targets.json`.
2. `python scripts/make-qr.py`
3. Reemplazar los afiches impresos con los archivos nuevos.

La app lee ese mismo JSON, así que el sitio y los códigos impresos nunca quedan
apuntando a lugares distintos.

## Parámetros usados

- **Corrección de errores: H (30 %).** Aguanta manchas, reflejos y folios gastados.
  Es el nivel que conviene para material impreso de una sola noche.
- **Zona de silencio: 4 módulos.** No recortar el margen blanco al maquetar.
- **Contraste:** `#111319` sobre blanco puro. No invertir (QR claro sobre fondo oscuro
  falla en muchos lectores).

## Tamaños de impresión

| Soporte | Tamaño mínimo del QR |
|---|---|
| Volante / programa | 2,5 cm |
| Afiche A4 o carta | 5 cm |
| Pantalla del salón | 8 cm (o ancho de pantalla dividido entre 4) |

Regla práctica: el código debe leerse desde la distancia a la que la persona va a
estar. Para un atril o una mesa, 5 cm es cómodo.

## Verificar un QR antes de imprimir

1. Escanear con **dos teléfonos distintos** (uno Android y uno iPhone).
2. Confirmar que abre directo la experiencia, sin pantalla intermedia.
3. Probar con los datos móviles apagados, solo wifi del lugar.

Si el QR abre un login de Google o un error de página, **no está apuntando al sitio
correcto**: revisar `qr-targets.json` y regenerar.
