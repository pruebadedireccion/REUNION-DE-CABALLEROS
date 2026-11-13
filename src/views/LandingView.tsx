import { useCallback, useEffect } from 'react';
import { PREDICA_TITULO } from '../data/experienceConfig';

interface LandingViewProps {
  onNavigate: (path: string) => void;
}

/**
 * Portada: únicamente el título de la prédica.
 * Toda la pantalla es el acceso a la experiencia.
 */
export default function LandingView({ onNavigate }: LandingViewProps) {
  const enter = useCallback(() => {
    onNavigate('/ar');
  }, [onNavigate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Entrar a la experiencia: ${PREDICA_TITULO}`}
      onClick={enter}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          enter();
        }
      }}
      className="relative flex min-h-screen w-full cursor-pointer select-none flex-col overflow-hidden bg-[#0d0f13] text-[#f3efe6] outline-none"
    >
      {/* Ambiente: luz cálida que respira, sin elementos de juego */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(217,155,88,0.16),transparent_60%),radial-gradient(100%_80%_at_50%_115%,rgba(60,74,96,0.35),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="landing-glow pointer-events-none absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d99b58]/10 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(255,255,255,0.35)_0.5px,transparent_0.5px)] [background-size:3px_3px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(13,15,19,0.9),transparent_35%,transparent_65%,rgba(13,15,19,0.85))]"
      />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 sm:px-10">
        <h1 className="landing-title font-display mx-auto w-full max-w-[18ch] text-center text-[clamp(1.9rem,7vw,6rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-[#f3efe6] [text-wrap:balance] [hyphens:none]">
          {PREDICA_TITULO}
        </h1>

        <div className="mt-12 flex flex-col items-center gap-4 sm:mt-16">
          <span
            aria-hidden="true"
            className="landing-line h-12 w-px bg-gradient-to-b from-transparent via-[#d99b58]/80 to-transparent"
          />
          <span className="text-[0.6rem] font-medium uppercase tracking-[0.42em] text-[#949ba7] sm:text-[0.68rem]">
            Toca para entrar
          </span>
        </div>
      </main>
    </div>
  );
}
