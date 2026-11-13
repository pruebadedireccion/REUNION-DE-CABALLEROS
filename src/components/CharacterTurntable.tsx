import { useCallback, useEffect, useRef } from 'react';

export type TurntableMode = 'auto' | 'gyro';

interface CharacterTurntableProps {
  mode: TurntableMode;
  /** Detiene el paneo (por ejemplo, con una reflexión abierta). */
  paused?: boolean;
  /** Se dispara la primera vez que la persona arrastra o gira el teléfono. */
  onFirstInteraction?: () => void;
  /** Avisa cuando las 8 vistas están listas para pintarse. */
  onReady?: () => void;
}

const FRAME_COUNT = 8;
const STEP = 360 / FRAME_COUNT;

/** Grados por segundo del paneo automático: una vuelta completa en ~14 s. */
const AUTO_SPEED = 26;
/** Fracción del paso en la que arranca el fundido hacia la vista siguiente. */
const BLEND_FROM = 0.68;
/** Tiempo de cortesía tras un arrastre antes de retomar el paneo. */
const RESUME_DELAY = 3800;
/** Sensibilidad del giroscopio (1 = el personaje sigue 1:1 al teléfono). */
const GYRO_SENSITIVITY = 1.15;

const FRAME_URLS = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `${import.meta.env.BASE_URL}frames/v${String(i).padStart(2, '0')}.jpg`
);

/** Fondo plano del turnaround original que hay que recortar. */
const KEY_TOLERANCE = 10;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const normalize = (deg: number) => ((deg % 360) + 360) % 360;
const shortestDelta = (deg: number) => (((deg % 360) + 540) % 360) - 180;

/**
 * Separa al personaje del fondo de estudio.
 *
 * El fondo no es de un solo color (tiene degradado y una banda más oscura),
 * así que un chroma key deja un rectángulo visible. En cambio se rellena desde
 * los bordes siguiendo el degradado suave: el fondo es continuo y la silueta
 * del personaje lo corta. Después se erosiona 1 px y se difumina el alfa para
 * que no quede filo gris.
 */
function buildMatte(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  const w = canvas.width;
  const h = canvas.height;
  const total = w * h;

  const background = new Uint8Array(total);
  const stack = new Int32Array(total);
  let top = 0;

  const seed = (index: number) => {
    if (background[index]) return;
    background[index] = 1;
    stack[top++] = index;
  };

  for (let x = 0; x < w; x += 1) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) {
    seed(y * w);
    seed(y * w + w - 1);
  }

  while (top > 0) {
    const index = stack[--top];
    const offset = index * 4;
    const r = px[offset];
    const g = px[offset + 1];
    const b = px[offset + 2];
    const x = index % w;

    if (x > 0) {
      const n = index - 1;
      if (!background[n]) {
        const o = n * 4;
        if (
          Math.abs(px[o] - r) <= KEY_TOLERANCE &&
          Math.abs(px[o + 1] - g) <= KEY_TOLERANCE &&
          Math.abs(px[o + 2] - b) <= KEY_TOLERANCE
        ) {
          background[n] = 1;
          stack[top++] = n;
        }
      }
    }
    if (x < w - 1) {
      const n = index + 1;
      if (!background[n]) {
        const o = n * 4;
        if (
          Math.abs(px[o] - r) <= KEY_TOLERANCE &&
          Math.abs(px[o + 1] - g) <= KEY_TOLERANCE &&
          Math.abs(px[o + 2] - b) <= KEY_TOLERANCE
        ) {
          background[n] = 1;
          stack[top++] = n;
        }
      }
    }
    if (index >= w) {
      const n = index - w;
      if (!background[n]) {
        const o = n * 4;
        if (
          Math.abs(px[o] - r) <= KEY_TOLERANCE &&
          Math.abs(px[o + 1] - g) <= KEY_TOLERANCE &&
          Math.abs(px[o + 2] - b) <= KEY_TOLERANCE
        ) {
          background[n] = 1;
          stack[top++] = n;
        }
      }
    }
    if (index < total - w) {
      const n = index + w;
      if (!background[n]) {
        const o = n * 4;
        if (
          Math.abs(px[o] - r) <= KEY_TOLERANCE &&
          Math.abs(px[o + 1] - g) <= KEY_TOLERANCE &&
          Math.abs(px[o + 2] - b) <= KEY_TOLERANCE
        ) {
          background[n] = 1;
          stack[top++] = n;
        }
      }
    }
  }

  // Alfa base + erosión de 1 px (mata el filo claro) + suavizado
  const alpha = new Uint8Array(total);
  for (let i = 0; i < total; i += 1) alpha[i] = background[i] ? 0 : 255;

  const eroded = new Uint8Array(total);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (!alpha[i]) continue;
      const up = y > 0 ? alpha[i - w] : 255;
      const down = y < h - 1 ? alpha[i + w] : 255;
      const left = x > 0 ? alpha[i - 1] : 255;
      const right = x < w - 1 ? alpha[i + 1] : 255;
      eroded[i] = Math.min(up, down, left, right);
    }
  }

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          sum += eroded[ny * w + nx];
          count += 1;
        }
      }
      px[i * 4 + 3] = Math.round(sum / count);
    }
  }

  ctx.putImageData(data, 0, 0);
  return canvas;
}

export default function CharacterTurntable({
  mode,
  paused = false,
  onFirstInteraction,
  onReady,
}: CharacterTurntableProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  const onFirstInteractionRef = useRef(onFirstInteraction);

  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const resumeAtRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const pointerVelocityRef = useRef(0);

  const tiltRef = useRef({ y: 0 });
  const tiltTargetRef = useRef({ y: 0 });

  const gyroRef = useRef<{ baseAlpha: number; baseBeta: number; angle: number } | null>(null);
  const modeRef = useRef(mode);
  const pausedRef = useRef(paused);
  const interactedRef = useRef(false);

  useEffect(() => {
    onReadyRef.current = onReady;
    onFirstInteractionRef.current = onFirstInteraction;
  }, [onReady, onFirstInteraction]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const notifyInteraction = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    onFirstInteractionRef.current?.();
  }, []);

  // Carga de vistas + recorte del fondo
  useEffect(() => {
    let cancelled = false;
    let pending = FRAME_COUNT;
    const mattes: (HTMLCanvasElement | null)[] = new Array(FRAME_COUNT).fill(null);

    FRAME_URLS.forEach((url, index) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        mattes[index] = buildMatte(img);
        pending -= 1;
        if (pending === 0) {
          const ready = mattes.every((m): m is HTMLCanvasElement => Boolean(m));
          framesRef.current = mattes.filter((m): m is HTMLCanvasElement => Boolean(m));
          readyRef.current = ready;
          if (ready) onReadyRef.current?.();
        }
      };
      img.onerror = () => {
        pending -= 1;
      };
      img.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Giroscopio
  useEffect(() => {
    if (mode !== 'gyro') {
      gyroRef.current = null;
      tiltTargetRef.current = { y: 0 };
      return;
    }

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null) return;

      if (!gyroRef.current) {
        gyroRef.current = {
          baseAlpha: event.alpha,
          baseBeta: event.beta ?? 0,
          angle: angleRef.current,
        };
        return;
      }

      const delta = shortestDelta(event.alpha - gyroRef.current.baseAlpha);
      angleRef.current = normalize(gyroRef.current.angle + delta * GYRO_SENSITIVITY);

      const betaDelta = clamp((event.beta ?? gyroRef.current.baseBeta) - gyroRef.current.baseBeta, -35, 35);
      tiltTargetRef.current = { y: -betaDelta * 0.9 };
      notifyInteraction();
    };

    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
  }, [mode, notifyInteraction]);

  // Bucle de dibujo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;
    let elapsed = 0;

    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(canvas);

    const paint = () => {
      const w = width;
      const h = height;
      if (!w || !h) return;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#07080a');
      bg.addColorStop(0.5, '#0c0e12');
      bg.addColorStop(1, '#15171b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const haloR = Math.max(w, h) * 0.6;
      const halo = ctx.createRadialGradient(w * 0.5, h * 0.4, haloR * 0.05, w * 0.5, h * 0.4, haloR);
      halo.addColorStop(0, 'rgba(212, 156, 96, 0.17)');
      halo.addColorStop(0.42, 'rgba(146, 104, 68, 0.07)');
      halo.addColorStop(1, 'rgba(8, 9, 11, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      const frames = framesRef.current;
      if (!frames.length) return;

      const angle = normalize(angleRef.current);
      const exact = angle / STEP;
      const index = Math.floor(exact) % FRAME_COUNT;
      const frac = exact - Math.floor(exact);
      const nextIndex = (index + 1) % FRAME_COUNT;
      const mix = frac <= BLEND_FROM ? 0 : (frac - BLEND_FROM) / (1 - BLEND_FROM);

      const current = frames[index];
      const following = frames[nextIndex];

      const figureH = h * 0.9;
      const scale = figureH / current.height;
      const dw = current.width * scale;
      const dh = figureH;
      const drift = Math.sin(elapsed * 0.32) * h * 0.0032;
      const tilt = tiltRef.current.y;
      const dx = (w - dw) / 2;
      const dy = h - dh - h * 0.03 + drift + tilt;
      const feetY = dy + dh;

      // Charco de luz en el piso
      ctx.save();
      ctx.translate(w * 0.5, feetY);
      ctx.scale(1, 0.16);
      const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.55);
      pool.addColorStop(0, 'rgba(198, 144, 86, 0.16)');
      pool.addColorStop(0.5, 'rgba(150, 108, 66, 0.06)');
      pool.addColorStop(1, 'rgba(8, 9, 11, 0)');
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sombra de contacto
      ctx.save();
      ctx.translate(dx + dw / 2, feetY);
      ctx.scale(1, 0.14);
      const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, dw * 0.44);
      shadow.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
      shadow.addColorStop(0.55, 'rgba(0, 0, 0, 0.34)');
      shadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(0, 0, dw * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Personaje: vista firme + fundido corto hacia la siguiente
      ctx.drawImage(current, dx, dy, dw, dh);
      if (mix > 0.001) {
        ctx.globalAlpha = mix;
        ctx.drawImage(following, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }

      // Unifica el personaje con la escena (luz tenue, no foto pegada)
      const grade = ctx.createLinearGradient(0, 0, w, h);
      grade.addColorStop(0, 'rgba(8, 9, 12, 0.22)');
      grade.addColorStop(0.55, 'rgba(8, 9, 12, 0.02)');
      grade.addColorStop(1, 'rgba(12, 9, 7, 0.28)');
      ctx.fillStyle = grade;
      ctx.fillRect(0, 0, w, h);

      // Remate inferior: el piso se funde en penumbra
      const floorFade = ctx.createLinearGradient(0, h * 0.9, 0, h);
      floorFade.addColorStop(0, 'rgba(10, 11, 14, 0)');
      floorFade.addColorStop(1, 'rgba(10, 11, 14, 0.85)');
      ctx.fillStyle = floorFade;
      ctx.fillRect(0, h * 0.9, w, h * 0.1);
    };

    const step = (dt: number) => {
      if (modeRef.current === 'gyro') {
        tiltRef.current.y += (tiltTargetRef.current.y - tiltRef.current.y) * Math.min(1, dt * 6);
        return;
      }

      tiltRef.current.y += (0 - tiltRef.current.y) * Math.min(1, dt * 6);

      const blocked =
        draggingRef.current || pausedRef.current || performance.now() < resumeAtRef.current;

      if (blocked) return;

      if (Math.abs(velocityRef.current) > 0.6) {
        angleRef.current = normalize(angleRef.current + velocityRef.current * dt);
        velocityRef.current *= Math.exp(-2.6 * dt);
        if (Math.abs(velocityRef.current) <= 0.6) velocityRef.current = 0;
        return;
      }

      velocityRef.current = 0;
      angleRef.current = normalize(angleRef.current + AUTO_SPEED * dt);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      if (readyRef.current) {
        step(dt);
        paint();
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  // Arrastre con el dedo
  const onPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    lastPointerTimeRef.current = performance.now();
    pointerVelocityRef.current = 0;
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!draggingRef.current) return;
      const now = performance.now();
      const dx = event.clientX - lastPointerXRef.current;
      const dt = Math.max(8, now - lastPointerTimeRef.current) / 1000;
      lastPointerXRef.current = event.clientX;
      lastPointerTimeRef.current = now;

      if (modeRef.current === 'gyro') return;

      // Arrastrar a la derecha gira al personaje, como en una mesa giratoria.
      angleRef.current = normalize(angleRef.current - dx * 0.32);
      pointerVelocityRef.current = (-dx * 0.32) / dt;
      notifyInteraction();
    },
    [notifyInteraction]
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    velocityRef.current = clamp(pointerVelocityRef.current, -260, 260);
    pointerVelocityRef.current = 0;
    resumeAtRef.current = performance.now() + RESUME_DELAY;
    notifyInteraction();
  }, [notifyInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Personaje en la habitación. Arrastra o mueve el teléfono para girar alrededor."
    />
  );
}
