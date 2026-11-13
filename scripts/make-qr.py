"""
Genera los códigos QR de cada utilidad del sitio.

Fuente única de verdad: src/data/qr-targets.json
(el mismo archivo que usa la app, para que nunca se desincronicen)

Uso:
    python scripts/make-qr.py

Salida en public/qr/:
    <slug>.png   ~2000 px, listo para imprimir
    <slug>.svg   vectorial, para imprenta
"""

import json
from pathlib import Path

import segno

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "src" / "data" / "qr-targets.json"
OUT = ROOT / "public" / "qr"

DARK = "#111319"
LIGHT = "#ffffff"
TARGET_PX = 2000


def build(slug: str, url: str) -> None:
    qr = segno.make(url, error="h")
    modules = len(qr.matrix) + 8  # + zona de silencio
    scale = max(8, round(TARGET_PX / modules))

    qr.save(OUT / f"{slug}.png", scale=scale, border=4, dark=DARK, light=LIGHT)
    qr.save(OUT / f"{slug}.svg", border=4, dark=DARK, light=LIGHT)

    print(f"  {slug:16s} {url}")


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    site = config["site"].rstrip("/")

    OUT.mkdir(parents=True, exist_ok=True)

    print(f"Sitio: {site}")
    for item in config["utilities"]:
        path = item["path"] if item["path"].startswith("/") else f"/{item['path']}"
        build(item["qr"], f"{site}{path}")

    print(f"\n{len(config['utilities'])} códigos generados en: {OUT}")


if __name__ == "__main__":
    main()
