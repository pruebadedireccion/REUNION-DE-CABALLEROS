import { ArrowRight, Eye, MonitorPlay, ShieldCheck } from 'lucide-react';
import { GREMIOS } from '../data/experienceConfig';

interface LandingViewProps {
  onNavigate: (path: string) => void;
  hasRegistered: boolean;
}

export default function LandingView({ onNavigate, hasRegistered }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-[#121418] text-[#f3efe6] flex flex-col">
      {/* Top Bar — 3 zones */}
      <header className="w-full border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <button
            onClick={() => onNavigate('/')}
            className="font-display text-lg font-semibold tracking-tight text-[#f3efe6] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Detrás de la apariencia
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#a6adb8]">
            <button
              onClick={() => onNavigate('/entrar')}
              className="hover:text-[#f3efe6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Presentarse
            </button>
            <button
              onClick={() => onNavigate('/ar?demo=1')}
              className="hover:text-[#f3efe6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Habitación 3D
            </button>
            <button
              onClick={() => onNavigate('/m')}
              className="hover:text-[#f3efe6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              QR Proyector
            </button>
            <button
              onClick={() => onNavigate('/panel')}
              className="hover:text-[#f3efe6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Facilitador
            </button>
          </nav>

          <button
            onClick={() => onNavigate(hasRegistered ? '/ar' : '/entrar')}
            className="rounded-lg bg-[#d99b58] px-4 py-2.5 text-sm font-semibold text-[#121418] hover:bg-[#e4ab6c] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {hasRegistered ? 'Volver a la habitación' : 'Entrar ahora'}
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Left Narrative */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-sm font-medium tracking-wide text-[#d99b58]">
              Iglesia El Remanente · Reunión de Caballeros
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-[#f3efe6] sm:text-5xl [text-wrap:balance]">
              El peso que no se ve detrás de la sonrisa
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#b4bac4] sm:text-lg">
              Afuera todos decimos que todo está bajo control. Hoy vas a entrar en silencio a la
              habitación de un hombre común —sin máscaras, sin discursos— para mirar de frente lo
              que muchos cargamos solos.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate(hasRegistered ? '/ar' : '/entrar')}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-lg bg-[#d99b58] px-6 py-3 text-base font-semibold text-[#121418] hover:bg-[#e5ad70] transition-colors cursor-pointer"
              >
                <span>{hasRegistered ? 'Entrar a la habitación 3D' : 'Presentarme y entrar'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={() => onNavigate('/ar?demo=1')}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-white/15 bg-[#1a1d23] px-5 py-3 text-sm font-medium text-[#e4dfd5] hover:bg-[#232730] transition-colors cursor-pointer"
              >
                <Eye className="h-4 w-4 text-[#d99b58]" />
                <span>Recorrido directo (Demo 3D)</span>
              </button>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs font-medium text-[#8c939f]">
                Gremios invitados esta noche
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#cfd4dc]">
                {GREMIOS.map((g, idx) => (
                  <span key={g.id} className="inline-flex items-center gap-3">
                    <span>{g.nombre}</span>
                    {idx < GREMIOS.length - 1 && (
                      <span aria-hidden="true" className="text-white/25">
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Reference Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#181b21]">
              <div className="relative flex-1 min-h-[280px] overflow-hidden bg-[#1e222a]">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_23cuzt23cuzt23cu_2197ec6e.jpg"
                  alt="Estudio de personaje: hombre cansado con camisa de jean desgastada, barba descuidada y tenis desatados"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181b21] via-transparent to-transparent" />
              </div>

              <div className="p-6">
                <p className="font-display text-xl font-medium text-[#f3efe6]">
                  «Nadie entra a la casa de otro hombre sin presentarse.»
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#a6adb8]">
                  Regístrate con tu nombre y tu gremio para recorrer en 3D los trece objetos de esta
                  habitación. Arrastra la pantalla para mirar alrededor y toca cada objeto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quiet Footer for Organizers */}
      <footer className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-[#8d94a0]">
          <span>Iglesia El Remanente · Experiencia física + 3D</span>
          <div className="flex items-center gap-5">
            <button
              onClick={() => onNavigate('/m')}
              className="inline-flex items-center gap-1.5 hover:text-[#f3efe6] transition-colors cursor-pointer"
            >
              <MonitorPlay className="h-3.5 w-3.5" />
              <span>QR Maestro (Proyector)</span>
            </button>
            <button
              onClick={() => onNavigate('/panel')}
              className="inline-flex items-center gap-1.5 hover:text-[#f3efe6] transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Panel Facilitador</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
