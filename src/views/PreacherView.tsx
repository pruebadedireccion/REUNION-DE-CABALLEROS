import { ArrowLeft, BookOpen } from 'lucide-react';
import QrCodeBlock from '../components/QrCodeBlock';

interface PreacherViewProps {
  onNavigate: (path: string) => void;
}

export default function PreacherView({ onNavigate }: PreacherViewProps) {
  const preacherUrl = `${window.location.origin}/p`;

  return (
    <div className="min-h-screen bg-[#121418] text-[#f3efe6] flex flex-col">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            onClick={() => onNavigate('/panel')}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#b4bac4] hover:text-[#f3efe6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al panel</span>
          </button>
          <span className="text-sm font-medium text-[#d99b58]">Vista del Predicador · Pastor Iván</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center gap-2 text-sm font-medium text-[#d99b58]">
          <BookOpen className="h-4 w-4" />
          <span>Revelación final del mensaje</span>
        </div>

        <h1 className="font-display mt-3 text-3xl font-semibold text-[#f3efe6] sm:text-5xl [text-wrap:balance]">
          El póster mostraba una sonrisa; la habitación, una vida sin Cristo
        </h1>

        <p className="mt-4 text-base leading-relaxed text-[#b4bac4]">
          Los hombres acaban de armar el rompecabezas «NO ESTÁ BIEN» y recorrer los trece pesos de
          la habitación. Este cierre conecta la tensión silenciosa del cuarto con el descanso en
          Cristo y la hermandad entre hombres.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/12 bg-[#171a20] p-6">
            <p className="text-xs font-semibold tracking-wide text-[#d99b58]">Mateo 11:28 (RVR1960)</p>
            <blockquote className="font-display mt-3 text-xl leading-relaxed text-[#f3efe6]">
              «Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.»
            </blockquote>
            <p className="mt-4 text-sm leading-relaxed text-[#a6adb8]">
              El hombre de la habitación no tenía una cruz en su cuarto: intentaba anestesiar su
              peso con cigarrillos, trabajo y silencio. Solo Cristo quita la carga que ningún
              esfuerzo propio logra soltar.
            </p>
          </article>

          <article className="rounded-2xl border border-white/12 bg-[#171a20] p-6">
            <p className="text-xs font-semibold tracking-wide text-[#d99b58]">Gálatas 6:2 (RVR1960)</p>
            <blockquote className="font-display mt-3 text-xl leading-relaxed text-[#f3efe6]">
              «Sobrellevad los unos las cargas de los otros, y cumplid así la ley de Cristo.»
            </blockquote>
            <p className="mt-4 text-sm leading-relaxed text-[#a6adb8]">
              Mecánicos, futboleros, comerciantes e ingenieros: Dios no diseñó a un hombre para
              pelear detrás de una puerta cerrada por dentro. Hoy abrimos la puerta entre hermanos.
            </p>
          </article>
        </div>

        <section className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-[#171a20] p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#f3efe6]">
              QR exclusivo de cierre (Predicador)
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#a6adb8]">
              Proyecta o comparte este enlace únicamente al finalizar la predicación para que los
              caballeros conserven los dos versículos de la noche.
            </p>
          </div>
          <QrCodeBlock value={preacherUrl} size={150} />
        </section>
      </main>
    </div>
  );
}
