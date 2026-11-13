import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  DoorClosed,
  RotateCcw,
  Smartphone,
  X,
} from 'lucide-react';
import {
  CAMERA_PRESETS,
  CaballeroRegistro,
  ROOM_OBJECTS,
  RoomObjectSpec,
  getDiscoveredObjectIds,
  saveDiscoveredObjectIds,
} from '../data/experienceConfig';
import RoomCanvas, { CameraFocusRequest } from '../three/RoomCanvas';

interface RoomExperienceViewProps {
  onNavigate: (path: string) => void;
  caballero: CaballeroRegistro | null;
  isDemo: boolean;
}

export default function RoomExperienceView({
  onNavigate,
  caballero,
  isDemo,
}: RoomExperienceViewProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [dockExpanded, setDockExpanded] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string>('frente');
  const [focusRequest, setFocusRequest] = useState<CameraFocusRequest | null>(null);
  const [selectedObj, setSelectedObj] = useState<RoomObjectSpec | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(() => getDiscoveredObjectIds());
  const [showClosing, setShowClosing] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [recenterNonce, setRecenterNonce] = useState(0);
  const [gyroNotice, setGyroNotice] = useState<string | null>(null);

  const discoveredSet = useMemo(() => new Set(discoveredIds), [discoveredIds]);

  useEffect(() => {
    if (!gyroNotice) return;
    const timer = window.setTimeout(() => setGyroNotice(null), 5500);
    return () => window.clearTimeout(timer);
  }, [gyroNotice]);

  const handleGyroUnavailable = useCallback((reason: string) => {
    setGyroEnabled(false);
    setGyroNotice(reason);
  }, []);

  const handleToggleGyro = async () => {
    setGyroNotice(null);
    if (gyroEnabled) {
      setGyroEnabled(false);
      return;
    }

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setGyroNotice('Este navegador no admite giroscopio. Arrastra la pantalla para mirar.');
      return;
    }

    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result !== 'granted') {
          setGyroNotice(
            'Permiso de movimiento denegado. Puedes seguir explorando al arrastrar la pantalla.'
          );
          return;
        }
      } catch {
        setGyroNotice(
          'No se pudo activar el sensor en este dispositivo. Arrastra la pantalla para mirar.'
        );
        return;
      }
    }

    setSelectedObj(null);
    setGyroEnabled(true);
  };

  const inspectObject = useCallback(
    (objectId: string) => {
      const found = ROOM_OBJECTS.find((o) => o.id === objectId);
      if (!found) return;

      setSelectedObj(found);
      setFocusRequest({
        pos: found.cameraPos,
        target: found.cameraTarget,
        nonce: Date.now(),
      });

      setDiscoveredIds((prev) => {
        if (prev.includes(objectId)) return prev;
        const next = [...prev, objectId];
        saveDiscoveredObjectIds(next);
        return next;
      });
    },
    []
  );

  const handlePreset = (presetId: string) => {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setGyroEnabled(false);
    setActivePresetId(presetId);
    setSelectedObj(null);
    setFocusRequest({
      pos: preset.pos,
      target: preset.target,
      nonce: Date.now(),
    });
  };

  const handleNextObject = () => {
    if (!selectedObj) {
      inspectObject(ROOM_OBJECTS[0].id);
      return;
    }
    const idx = ROOM_OBJECTS.findIndex((o) => o.id === selectedObj.id);
    const nextIdx = (idx + 1) % ROOM_OBJECTS.length;
    inspectObject(ROOM_OBJECTS[nextIdx].id);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#121418] text-[#f3efe6] select-none">
      {/* Isolated 3D WebGL Viewport */}
      <div className="h-full w-full">
        <RoomCanvas
          onSelectObject={inspectObject}
          focusRequest={focusRequest}
          gyroEnabled={gyroEnabled}
          recenterNonce={recenterNonce}
          onGyroUnavailable={handleGyroUnavailable}
        />
      </div>

      {/* Minimal Top HUD (Solid surface, NO backdrop-filter over WebGL) */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/12 bg-[#14171d]/95 px-4 py-2.5 shadow-lg">
          <button
            onClick={() => onNavigate('/')}
            aria-label="Salir de la habitación"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#b4bac4] hover:bg-white/10 hover:text-[#f3efe6] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="font-display text-sm font-semibold leading-tight text-[#f3efe6]">
              Detrás de la apariencia
            </p>
            <p className="font-mono-num text-xs text-[#d99b58]">
              {discoveredIds.length} / {ROOM_OBJECTS.length} pesos observados
              {caballero ? ` · ${caballero.nombre.split(' ')[0]}` : isDemo ? ' · Demo' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowClosing(true)}
          className="pointer-events-auto inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#d99b58]/40 bg-[#1c1a17]/95 px-4 py-2 text-sm font-semibold text-[#f3efe6] hover:bg-[#2a241d] transition-colors shadow-lg cursor-pointer whitespace-nowrap shrink-0"
        >
          <DoorClosed className="h-4 w-4 text-[#d99b58]" />
          <span>Cerrar recorrido</span>
        </button>
      </header>

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-10 flex flex-col items-center px-3">
        {gyroNotice && (
          <div
            role="status"
            className="pointer-events-auto mb-2 flex max-w-md items-center gap-2.5 rounded-xl border border-[#d99b58]/40 bg-[#1c1a17] px-3.5 py-2 text-xs text-[#f3efe6] shadow-lg"
          >
            <Smartphone className="h-4 w-4 shrink-0 text-[#d99b58]" />
            <span>{gyroNotice}</span>
            <button
              onClick={() => setGyroNotice(null)}
              aria-label="Cerrar aviso"
              className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#b4bac4] hover:bg-white/10 hover:text-[#f3efe6] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => setDockExpanded((v) => !v)}
          className="pointer-events-auto mb-1.5 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#16191f]/95 px-3.5 py-1.5 text-xs font-medium text-[#cfd4dc] hover:text-[#f3efe6] transition-colors shadow-md cursor-pointer"
        >
          {dockExpanded ? (
            <>
              <ChevronDown className="h-3.5 w-3.5 text-[#d99b58]" />
              <span>Ocultar controles</span>
            </>
          ) : (
            <>
              <ChevronUp className="h-3.5 w-3.5 text-[#d99b58]" />
              <span>Mostrar controles</span>
            </>
          )}
        </button>

        {dockExpanded && (
          <div className="pointer-events-auto w-full max-w-[920px] rounded-2xl border border-white/12 bg-[#16191f]/95 p-3 shadow-2xl">
            {/* Row 1: Gyroscope toggle + Camera angle presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleGyro}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    gyroEnabled
                      ? 'border-[#d99b58] bg-[#d99b58] text-[#121418]'
                      : 'border-[#d99b58]/40 bg-[#22262f] text-[#f3efe6] hover:bg-[#2c313c]'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{gyroEnabled ? 'Giroscopio: Activo' : 'Usar giroscopio'}</span>
                </button>

                {gyroEnabled && (
                  <button
                    onClick={() => setRecenterNonce((n) => n + 1)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#22262f] px-3 py-1.5 text-xs font-medium text-[#f3efe6] hover:bg-[#2c313c] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#d99b58]" />
                    <span>Recentrar vista</span>
                  </button>
                )}

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#9ca3af]">
                  <Compass className="h-3.5 w-3.5 text-[#d99b58]" />
                  <span>
                    {gyroEnabled
                      ? 'Mueve tu celular para mirar la habitación'
                      : 'Arrastra o elige un ángulo:'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {CAMERA_PRESETS.map((preset) => {
                  const active = !gyroEnabled && activePresetId === preset.id && !selectedObj;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePreset(preset.id)}
                      className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#d99b58] text-[#121418]'
                          : 'bg-[#22262f] text-[#d1d5db] hover:bg-[#2c313c]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Scrollable quick selector for all 13 objects (elder-friendly fallback for tapping) */}
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
              {ROOM_OBJECTS.map((obj) => {
                const seen = discoveredSet.has(obj.id);
                const isSelected = selectedObj?.id === obj.id;
                return (
                  <button
                    key={obj.id}
                    onClick={() => inspectObject(obj.id)}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#d99b58] bg-[#2a231a] text-[#f3efe6]'
                        : seen
                        ? 'border-white/15 bg-[#1e232b] text-[#cfd4dc] hover:border-white/30'
                        : 'border-white/10 bg-[#1a1d24] text-[#9ca3af] hover:text-[#f3efe6]'
                    }`}
                  >
                    {seen && <Check className="h-3.5 w-3.5 text-[#d99b58]" />}
                    <span>{obj.titulo.split(' ')[0] === 'El' ? 'El hombre' : obj.titulo.split(' ')[0] === 'La' ? 'La puerta' : obj.titulo.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Intro Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0d0f12]/90 p-5">
          <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#171a20] p-7 shadow-2xl">
            <p className="text-xs font-medium tracking-wide text-[#d99b58]">
              Antes de mirar alrededor
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-[#f3efe6] sm:text-3xl">
              Entraste a la habitación de un hombre como tú
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#b4bac4]">
              Afuera nadie nota nada extraño. Aquí adentro cada objeto guarda una parte del peso
              que calla.
            </p>
            <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-[#121418] p-4 text-sm text-[#cfd4dc]">
              <p>
                1. Arrastra la pantalla para girar la vista, o activa «Usar giroscopio» para mirar
                moviendo tu celular.
              </p>
              <p>2. Toca al hombre o cualquier objeto en el cuarto (o usa la barra inferior).</p>
              <p>3. Cuando termines de observar, presiona «Cerrar recorrido».</p>
            </div>
            <button
              onClick={() => setShowIntro(false)}
              className="mt-6 min-h-[52px] w-full rounded-xl bg-[#d99b58] px-6 py-3 text-base font-semibold text-[#121418] hover:bg-[#e5ad70] transition-colors cursor-pointer"
            >
              Mirar la habitación
            </button>
          </div>
        </div>
      )}

      {/* Object Reflection Sheet */}
      {selectedObj && !showClosing && (
        <div className="fixed inset-x-0 top-20 z-20 mx-auto w-[92vw] max-w-lg rounded-2xl border border-white/15 bg-[#171a20] p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#d99b58]">{selectedObj.etiqueta}</p>
              <h3 className="font-display mt-1 text-2xl font-semibold text-[#f3efe6]">
                {selectedObj.titulo}
              </h3>
            </div>
            <button
              onClick={() => setSelectedObj(null)}
              aria-label="Cerrar tarjeta"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#b4bac4] hover:bg-white/15 hover:text-[#f3efe6] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-4 text-base leading-relaxed text-[#cfd4dc]">{selectedObj.reflexion}</p>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#121418] p-4">
            <p className="text-xs font-medium text-[#9ca3af]">Pregunta para ti</p>
            <p className="mt-1 text-sm font-medium text-[#f3efe6]">{selectedObj.pregunta}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setSelectedObj(null)}
              className="min-h-[44px] rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-[#d1d5db] hover:bg-white/5 transition-colors cursor-pointer"
            >
              Seguir mirando
            </button>
            <button
              onClick={handleNextObject}
              className="min-h-[44px] rounded-lg bg-[#d99b58] px-4 py-2 text-sm font-semibold text-[#121418] hover:bg-[#e5ad70] transition-colors cursor-pointer"
            >
              Siguiente peso
            </button>
          </div>
        </div>
      )}

      {/* Non-spoiler Tension Closing Modal ("NO ESTÁ BIEN") */}
      {showClosing && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0c0e12]/95 p-5">
          <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#171a20] p-7 shadow-2xl">
            <p className="font-mono-num text-xs text-[#d99b58]">
              {discoveredIds.length} de {ROOM_OBJECTS.length} pesos observados
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#f3efe6]">
              No está bien.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#c2c8d1]">
              Detrás de la apariencia del hombre que sonríe en el póster, hay cansancio, humo,
              cuentas pendientes y una puerta cerrada por dentro.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#c2c8d1]">
              Muchos hombres en esta sala conocen esa misma habitación. No guardes el celular
              pensando que tienes que resolverlo todo solo esta noche.
            </p>

            <div className="mt-6 rounded-xl border border-[#d99b58]/30 bg-[#1f1b16] p-4">
              <p className="text-sm font-semibold text-[#f3efe6]">
                Levanta la vista hacia el frente.
              </p>
              <p className="mt-1 text-sm text-[#d9c4ab]">
                El Pastor Iván continúa con la palabra para esta noche.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowClosing(false)}
                className="min-h-[44px] rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[#d1d5db] hover:bg-white/5 transition-colors cursor-pointer"
              >
                Volver a la habitación
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="min-h-[44px] rounded-lg bg-[#d99b58] px-5 py-2.5 text-sm font-semibold text-[#121418] hover:bg-[#e5ad70] transition-colors cursor-pointer"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
