import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { GREMIOS, GremioId, saveCaballero } from '../data/experienceConfig';

interface RegistroViewProps {
  onNavigate: (path: string) => void;
  onRegistered: () => void;
}

export default function RegistroView({ onNavigate, onRegistered }: RegistroViewProps) {
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [gremio, setGremio] = useState<GremioId | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = nombre.trim();
    const cleanPhone = celular.trim();

    if (cleanName.length < 2) {
      setError('Por favor escribe tu nombre.');
      return;
    }
    if (cleanPhone.length < 7) {
      setError('Por favor escribe un número de celular válido.');
      return;
    }
    if (!gremio) {
      setError('Selecciona el gremio con el que participaste hoy.');
      return;
    }

    setError('');
    saveCaballero({
      nombre: cleanName,
      celular: cleanPhone,
      gremio,
    });
    onRegistered();
    onNavigate('/ar');
  };

  return (
    <div className="min-h-screen bg-[#121418] text-[#f3efe6] flex flex-col">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#b4bac4] hover:text-[#f3efe6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <span className="text-sm font-medium text-[#d99b58]">Iglesia El Remanente</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#f3efe6] sm:text-4xl [text-wrap:balance]">
            Nadie entra a la casa de otro hombre sin presentarse
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#a6adb8]">
            Deja tu nombre y tu gremio antes de abrir la puerta de esta habitación. Todo se
            mantiene en respeto y discreción.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-[#e4dfd5]">
              Tu nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              className="mt-2 block w-full min-h-[52px] rounded-lg border border-white/15 bg-[#1a1d23] px-4 text-base text-[#f3efe6] placeholder-[#6c7380] focus:border-[#d99b58] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="celular" className="block text-sm font-medium text-[#e4dfd5]">
              Tu número de celular
            </label>
            <input
              id="celular"
              type="tel"
              autoComplete="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Ej. 310 555 0192"
              className="mt-2 block w-full min-h-[52px] rounded-lg border border-white/15 bg-[#1a1d23] px-4 text-base text-[#f3efe6] placeholder-[#6c7380] focus:border-[#d99b58] focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-[#e4dfd5]">
              ¿De qué gremio eres esta noche?
            </span>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GREMIOS.map((item) => {
                const selected = gremio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGremio(item.id)}
                    className={`flex min-h-[76px] flex-col items-start justify-center rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#d99b58] bg-[#24201b]'
                        : 'border-white/12 bg-[#1a1d23] hover:border-white/25'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-base font-semibold text-[#f3efe6]">{item.nombre}</span>
                      {selected && <Check className="h-5 w-5 text-[#d99b58]" />}
                    </div>
                    <span className="mt-1 text-xs text-[#9ca3af]">{item.oficio}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-[#c96b5b]/40 bg-[#2a1a18] px-4 py-3 text-sm text-[#f2b8ae]">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full min-h-[54px] items-center justify-center gap-2.5 rounded-xl bg-[#d99b58] px-6 py-3.5 text-base font-semibold text-[#121418] hover:bg-[#e5ad70] transition-colors cursor-pointer"
          >
            <span>Entrar a la habitación</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
