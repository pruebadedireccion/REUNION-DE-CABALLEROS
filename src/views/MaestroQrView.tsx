import { ArrowLeft, Download, ExternalLink, Radio } from 'lucide-react';
import QRCode from 'qrcode';
import QrCodeBlock from '../components/QrCodeBlock';
import { PREDICA_TITULO } from '../data/experienceConfig';
import { UTILIDADES, UTILIDAD_EXPERIENCIA, siteUrl } from '../data/links';

interface MaestroQrViewProps {
  onNavigate: (path: string) => void;
}

const REPO_QR_URL = 'https://github.com/pruebadedireccion/REUNION-DE-CABALLEROS/tree/main/public/qr';

async function downloadQr(url: string, fileName: string) {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 1600,
      margin: 4,
      color: { dark: '#111319', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    // Si el navegador bloquea la descarga, el QR sigue visible en pantalla.
  }
}

export default function MaestroQrView({ onNavigate }: MaestroQrViewProps) {
  const secundarias = UTILIDADES.filter((item) => item.id !== UTILIDAD_EXPERIENCIA.id);

  return (
    <div className="min-h-screen bg-[#0b0d11] text-[#f3efe6]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0d11]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#b4bac4] transition-colors hover:text-[#f3efe6] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <span className="text-sm font-medium text-[#d99b58]">QR oficial · Logística</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-20 pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#d99b58]">
          Iglesia El Remanente · Reunión de Caballeros
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold leading-none text-[#f3efe6] sm:text-5xl">
          {PREDICA_TITULO}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#a9b0bb] sm:text-base">
          Cada código abre una utilidad distinta del sitio. El de la experiencia es el que va
          impreso; los demás son de uso interno del equipo.
        </p>

        {/* QR principal */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-[#d99b58]/30 bg-gradient-to-b from-[#1a1611] to-[#111318] p-5 sm:p-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md text-center sm:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d99b58]/40 bg-[#d99b58]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-[#e5b981]">
                <Radio className="h-3 w-3" />
                Uso principal
              </span>
              <h2 className="font-display mt-4 text-2xl font-semibold text-[#f8f4ea] sm:text-3xl">
                {UTILIDAD_EXPERIENCIA.nombre}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#b9b0a1]">
                {UTILIDAD_EXPERIENCIA.uso}
              </p>
              <p
                className="mt-4 select-all truncate text-left font-mono text-[0.72rem] text-[#cfc6b6]"
                title={UTILIDAD_EXPERIENCIA.url}
              >
                {UTILIDAD_EXPERIENCIA.url}
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <button
                  onClick={() => downloadQr(UTILIDAD_EXPERIENCIA.url, UTILIDAD_EXPERIENCIA.qr)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#d99b58] px-5 text-sm font-semibold text-[#14110c] transition-colors hover:bg-[#e8ae72] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar QR</span>
                </button>
                <a
                  href={UTILIDAD_EXPERIENCIA.url}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-medium text-[#e7e2d8] transition-colors hover:bg-white/5"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Probar enlace</span>
                </a>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl bg-[#f8f4ea] p-3 shadow-2xl">
              <QrCodeBlock value={UTILIDAD_EXPERIENCIA.url} size={248} />
            </div>
          </div>
        </section>

        {/* QR secundarios */}
        <h3 className="mt-12 text-xs font-semibold uppercase tracking-[0.22em] text-[#8f96a3]">
          Códigos internos
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {secundarias.map((item) => (
            <section
              key={item.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-[#141821] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display text-lg font-semibold leading-tight text-[#f3efe6]">
                    {item.nombre}
                  </h4>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-wide text-[#8f96a3]">
                    {item.publico}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <QrCodeBlock value={item.url} size={132} />
              </div>

              <p className="mt-3 flex-1 text-[0.8rem] leading-relaxed text-[#a9b0bb]">{item.uso}</p>
              <p
                className="mt-2 truncate font-mono text-[0.66rem] text-[#7f8794]"
                title={item.url}
              >
                {item.url}
              </p>

              <button
                onClick={() => downloadQr(item.url, item.qr)}
                className="mt-3 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-medium text-[#e4dfd5] transition-colors hover:bg-white/5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#d99b58]" />
                <span>Descargar</span>
              </button>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#11141a] p-4 text-sm text-[#9ea6b2] sm:flex-row sm:items-center">
          <p>
            Los archivos listos para imprenta están en el repositorio, en{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.78rem]">public/qr/</code>.
          </p>
          <a
            href={REPO_QR_URL}
            className="inline-flex items-center gap-1.5 font-medium text-[#d99b58] hover:text-[#e8ae72]"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Ver carpeta de QR</span>
          </a>
        </div>

        <p className="mt-6 text-center text-[0.72rem] text-[#6f7783]">
          Enlace del panel: <span className="font-mono">{siteUrl('/m')}</span>
        </p>
      </main>
    </div>
  );
}
