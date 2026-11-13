/** Modo de cámara de la experiencia. */
export type ViewMode = 'auto' | 'gyro';

/** ¿El dispositivo/navegador expone sensores de orientación? */
export function isMotionSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

/**
 * iOS 13+ exige permiso explícito y solo puede pedirse dentro de un gesto del usuario.
 * Devuelve true si el giroscopio quedó habilitado.
 */
export async function requestMotionAccess(): Promise<boolean> {
  if (!isMotionSupported()) return false;

  const ctor = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied' | string>;
  };

  if (typeof ctor.requestPermission === 'function') {
    try {
      const result = await ctor.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }

  return true;
}
