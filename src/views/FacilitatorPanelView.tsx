import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  MonitorPlay,
  Trash2,
} from 'lucide-react';
import {
  CaballeroRegistro,
  GREMIOS,
  clearAllLocalData,
  exportRegistrosCsv,
  getRegistrosList,
} from '../data/experienceConfig';

interface FacilitatorPanelViewProps {
  onNavigate: (path: string) => void;
  onDataCleared: () => void;
}

export default function FacilitatorPanelView({
  onNavigate,
  onDataCleared,
}: FacilitatorPanelViewProps) {
  const [registros, setRegistros] = useState<CaballeroRegistro[]>(() => getRegistrosList());
  const [confirmReset, setConfirmReset] = useState(false);

  const countByGuild = GREMIOS.map((g) => ({
    ...g,
    count: registros.filter((r) => r.gremio === g.id).length,
  }));

  const handleReset = () => {
    clearAllLocalData();
    setRegistros([]);
    setConfirmReset(false);
    onDataCleared();
  };

  return (
    <div className="min-h-screen bg-[#121418] text-[#f3efe6] flex flex-col">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#b4bac4] hover:text-[#f3efe6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Portada</span>
          </button>
          <span className="text-sm font-medium text-[#d99b58]">Panel del Facilitador</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-[#f3efe6]">
              Control de la Reunión
            </h1>
            <p className="mt-1 text-sm text-[#a6adb8]">
              Accesos rápidos para proyección, demostración 3D, predicador y exportación a Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/m')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#1a1d23] px-4 py-2 text-sm font-medium text-[#f3efe6] hover:bg-[#232730] transition-colors cursor-pointer"
            >
              <MonitorPlay className="h-4 w-4 text-[#d99b58]" />
              <span>QR Maestro</span>
            </button>
            <button
              onClick={() => onNavigate('/ar?demo=1')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#1a1d23] px-4 py-2 text-sm font-medium text-[#f3efe6] hover:bg-[#232730] transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 text-[#d99b58]" />
              <span>Abrir 3D Demo</span>
            </button>
            <button
              onClick={() => onNavigate('/p')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 bg-[#1a1d23] px-4 py-2 text-sm font-medium text-[#f3efe6] hover:bg-[#232730] transition-colors cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-[#d99b58]" />
              <span>Vista Predicador (/p)</span>
            </button>
          </div>
        </div>

        {/* Guild summary */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {countByGuild.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/10 bg-[#171a20] p-4">
              <p className="text-xs text-[#9ca3af]">{g.nombre}</p>
              <p className="font-mono-num mt-1 text-3xl font-semibold text-[#f3efe6]">{g.count}</p>
            </div>
          ))}
        </div>

        {/* Registration list + Excel Export */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#171a20] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-[#f3efe6]">
                Caballeros registrados ({registros.length})
              </h2>
              <p className="mt-1 text-xs text-[#9ca3af]">
                Descarga el archivo CSV compatible directamente con Microsoft Excel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => exportRegistrosCsv(registros)}
                disabled={registros.length === 0}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#d99b58] px-4 py-2 text-sm font-semibold text-[#121418] hover:bg-[#e5ad70] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Exportar a Excel (.csv)</span>
              </button>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  disabled={registros.length === 0}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm text-[#b4bac4] hover:text-[#f3efe6] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Limpiar pruebas</span>
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#9c3e32] px-4 py-2 text-sm font-semibold text-[#f3efe6] hover:bg-[#b5493b] transition-colors cursor-pointer"
                >
                  <span>Confirmar borrado local</span>
                </button>
              )}
            </div>
          </div>

          {registros.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/12 p-8 text-center text-sm text-[#8d94a0]">
              Aún no hay registros en este dispositivo. Cuando los caballeros ingresen por{' '}
              <button
                onClick={() => onNavigate('/entrar')}
                className="underline text-[#d99b58] cursor-pointer"
              >
                /entrar
              </button>
              , aparecerán aquí listos para exportar.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-xs text-[#9ca3af]">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Nombre</th>
                    <th className="py-3 pr-4 font-medium">Celular</th>
                    <th className="py-3 pr-4 font-medium">Gremio</th>
                    <th className="py-3 font-medium">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {registros.map((r) => {
                    const gNombre = GREMIOS.find((g) => g.id === r.gremio)?.nombre ?? r.gremio;
                    return (
                      <tr key={r.id}>
                        <td className="py-3 pr-4 font-medium text-[#f3efe6]">{r.nombre}</td>
                        <td className="font-mono-num py-3 pr-4 text-[#cfd4dc]">{r.celular}</td>
                        <td className="py-3 pr-4 text-[#d99b58]">{gNombre}</td>
                        <td className="font-mono-num py-3 text-xs text-[#9ca3af]">
                          {new Date(r.fechaIso).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
