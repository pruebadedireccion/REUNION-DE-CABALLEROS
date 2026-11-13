import { ArrowLeft, Smartphone } from 'lucide-react';
import QrCodeBlock from '../components/QrCodeBlock';

interface MaestroQrViewProps {
  onNavigate: (path: string) => void;
}

export default function MaestroQrView({ onNavigate }: MaestroQrViewProps) {
  const entryUrl = `${window.location.origin}/entrar`;

  return (
    <div className="min-h-screen bg-[#121418] text-[#f3efe6] flex flex-col">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#b4bac4] hover:text-[#f3efe6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <span className="text-sm font-medium text-[#d99b58]">Pantalla de Proyección · QR Maestro</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-sm font-medium tracking-wide text-[#d99b58]">
          Iglesia El Remanente · Reunión de Caballeros
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-[#f3efe6] sm:text-5xl [text-wrap:balance]">
          Detrás de la apariencia
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[#b4bac4]">
          Saca tu celular ahora, escanea este código QR, preséntate con tu gremio y entra en
          silencio a la habitación.
        </p>

        <div className="mt-8">
          <QrCodeBlock value={entryUrl} size={300} />
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-[#9ca3af]">
          <Smartphone className="h-4 w-4 text-[#d99b58]" />
          <span className="font-mono-num break-all">{entryUrl}</span>
        </div>
      </main>
    </div>
  );
}
