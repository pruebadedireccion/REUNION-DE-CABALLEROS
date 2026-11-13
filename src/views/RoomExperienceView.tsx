import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Maximize2, RotateCw, Smartphone, X } from 'lucide-react';
import CharacterTurntable from '../components/CharacterTurntable';
import { PREDICA_TITULO } from '../data/experienceConfig';
import { requestMotionAccess, type ViewMode } from '../lib/motion';

interface RoomExperienceViewProps {
  onNavigate: (path: string) => void;
}

function waitForOrientationEvent(timeoutMs = 1600): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('deviceorientation', onEvent);
      resolve(ok);
    };
    const onEvent = () => finish(true);
    window.addEventListener('deviceorientation', onEvent);
    window.setTimeout(() => finish(false), timeoutMs);
  });
}

export default function RoomExperienceView({ onNavigate }: RoomExperienceViewProps) {
  const [mode, setMode] = useState<ViewMode>('auto');
  const [ready, setReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showClosing, setShowClosing] = useState(false);
  const interactedRef = useRef(false);

  const canFullscreen = useMemo(
    () => typeof document !== 'undefined' && document.fullscreenEnabled !== false,
    []
  );

  const markInteraction = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    setHasInteracted(true);
  }, []);

  const activateMotion = useCallback(async () => {
    if (mode === 'gyro') {
      setMode('auto');
      return;
    }

    const granted = await requestMotionAccess();
    markInteraction();

    if (!granted) {
      setNotice('Tu navegador no autorizó el movimiento. Puedes seguir con el paneo automático.');
      setMode('auto');
      return;
    }

    setNotice(null);
    setMode('gyro');

    const receiving = await waitForOrientationEvent();
    if (!receiving) {
      setMode('auto');
      setNotice('No detectamos el sensor en este dispositivo. Usa el paneo automático.');
    }
  }, [mode, markInteraction]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setNotice('Este navegador no permite pantalla completa.');
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (hasInteracted) return;
    const timer = window.setTimeout(() => setHasInteracted(true), 9000);
    return () => window.clearTimeout(timer);
  }, [hasInteracted]);

  return (
    <div className="relative h-[100dvh] w-screen select-none overflow-hidden bg-[#07080a] text-[#f4efe6]">
      <CharacterTurntable
        mode={mode}
        paused={showClosing}
        onFirstInteraction={markInteraction}
        onReady={() => setReady(true)}
      />

      {/* Atmósfera cinematográfica */}
      <div className="cine-beam" aria-hidden="true" />
      <div className="cine-dust" aria-hidden="true" />
      <div className="cine-vignette" aria-hidden="true" />
      <div className="cine-grain" aria-hidden="true" />

      {/* Encabezado mínimo */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onNavigate('/')}
            aria-label="Volver a la portada"
            className="pointer-events-auto mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/25 text-[#c9ced6] backdrop-blur-sm transition-colors hover:border-white/25 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.38em] text-[#d99b58]/85">
              Iglesia El Remanente
            </p>
            <h1 className="font-display mt-1.5 text-base font-medium leading-tight tracking-wide text-[#f4efe6]/95 sm:text-lg">
              {PREDICA_TITULO}
            </h1>
          </div>
        </div>

        {canFullscreen && (
          <button
            onClick={toggleFullscreen}
            aria-label="Pantalla completa"
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/25 text-[#c9ced6] backdrop-blur-sm transition-colors hover:border-white/25 hover:text-white cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Pista inicial */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-8 transition-opacity duration-1000 ${
          hasInteracted || showClosing ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <p className="rounded-full border border-white/10 bg-black/45 px-5 py-2.5 text-center text-[0.72rem] font-medium tracking-wide text-[#dfe3e9] backdrop-blur-sm">
          Arrastra para girar · o mueve el teléfono
        </p>
      </div>

      {/* Aviso */}
      {notice && (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center px-4">
          <p className="rounded-xl border border-[#d99b58]/30 bg-[#1c1a16]/95 px-4 py-2.5 text-center text-xs text-[#e7d8c4] shadow-lg">
            {notice}
          </p>
        </div>
      )}

      {/* Control inferior */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-4 pb-6">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/35 p-1 backdrop-blur-md">
          <button
            onClick={() => {
              setMode('auto');
              markInteraction();
            }}
            aria-pressed={mode === 'auto'}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
              mode === 'auto'
                ? 'bg-[#d99b58] text-[#14110c]'
                : 'text-[#cfd4dc] hover:bg-white/10'
            }`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>360°</span>
          </button>

          <button
            onClick={activateMotion}
            aria-pressed={mode === 'gyro'}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
              mode === 'gyro'
                ? 'bg-[#d99b58] text-[#14110c]'
                : 'text-[#cfd4dc] hover:bg-white/10'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Giro</span>
          </button>
        </div>

        <button
          onClick={() => setShowClosing(true)}
          className="pointer-events-auto inline-flex min-h-[36px] items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[#8d94a0] transition-colors hover:text-[#e7e2d8] cursor-pointer"
        >
          <X className="h-3 w-3" />
          <span>Cerrar</span>
        </button>
      </div>

      {/* Carga */}
      {!ready && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#07080a]">
          <p className="animate-pulse text-[0.65rem] uppercase tracking-[0.4em] text-[#8d94a0]">
            Entrando
          </p>
        </div>
      )}

      {/* Cierre de la experiencia */}
      {showClosing && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#05060a]/92 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#11141a] p-6 shadow-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[#f8f4ea] sm:text-3xl">
              No está bien.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#c2c8d1]">
              Detrás de la apariencia del hombre que sonríe en el póster hay cansancio, humo,
              cuentas pendientes y una puerta cerrada por dentro.
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-[#c2c8d1]">
              No tienes que resolverlo todo solo esta noche.
            </p>

            <div className="mt-5 rounded-xl border border-[#d99b58]/30 bg-[#1f1b16] p-4">
              <p className="text-sm font-semibold text-[#f3efe6]">Levanta la vista hacia el frente.</p>
              <p className="mt-1 text-sm text-[#d9c4ab]">
                El Pastor Iván continúa con la palabra para esta noche.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setShowClosing(false)}
                className="min-h-[44px] rounded-lg border border-white/15 px-4 text-sm font-medium text-[#d1d5db] transition-colors hover:bg-white/5 cursor-pointer"
              >
                Volver a la habitación
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="min-h-[44px] rounded-lg bg-[#d99b58] px-5 text-sm font-semibold text-[#14110c] transition-colors hover:bg-[#e8ae72] cursor-pointer"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
