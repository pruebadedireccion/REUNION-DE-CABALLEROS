/**
 * Título oficial de la prédica.
 * Es lo único que se muestra en la portada del sitio.
 */
export const PREDICA_TITULO = 'Detrás de la apariencia';

/**
 * URL pública oficial (GitHub Pages).
 * El QR de logística apunta siempre a la experiencia, nunca a localhost.
 * Se define en `qr-targets.json` para que el sitio y los QR impresos coincidan.
 */
export { SITE_URL, EXPERIENCIA_URL } from './links';

export type GremioId = 'mecanicos' | 'futboleros' | 'comerciantes' | 'ingenieros';

export interface GremioInfo {
  id: GremioId;
  nombre: string;
  oficio: string;
  lema: string;
  color: string;
}

export const GREMIOS: GremioInfo[] = [
  {
    id: 'mecanicos',
    nombre: 'Mecánicos',
    oficio: 'Taller, motores y fierros',
    lema: 'Sabemos detectar un ruido extraño en cualquier motor, menos en el pecho.',
    color: '#d99b58',
  },
  {
    id: 'futboleros',
    nombre: 'Futboleros',
    oficio: 'Cancha, equipo y camiseta',
    lema: 'Nos damos palmadas en la espalda al salir de la cancha, pero nadie pregunta qué pasa en casa.',
    color: '#7da188',
  },
  {
    id: 'comerciantes',
    nombre: 'Comerciantes',
    oficio: 'Negocio, cuentas y trato',
    lema: 'Siempre mostramos buena cara para cerrar el trato, aunque por dentro las cuentas no cuadren.',
    color: '#889bb8',
  },
  {
    id: 'ingenieros',
    nombre: 'Ingenieros',
    oficio: 'Obra, planos y sistemas',
    lema: 'Calculamos estructuras para que soporten toneladas, pero olvidamos cuánto peso aguantamos solos.',
    color: '#c28b70',
  },
];

export interface RoomObjectSpec {
  id: string;
  titulo: string;
  etiqueta: string;
  gremioAfin?: string;
  reflexion: string;
  pregunta: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export const ROOM_OBJECTS: RoomObjectSpec[] = [
  {
    id: 'hombre',
    titulo: 'El hombre detrás del póster',
    etiqueta: 'Centro de la habitación',
    reflexion:
      'Afuera sonríe en la foto y responde «todo bien». Aquí adentro, con la camisa arrugada, ojeras hondas y la espalda vencida, sostiene lo que no le cuenta ni a su propia familia.',
    pregunta: '¿Qué parte de tu cansancio escondes cada mañana antes de salir?',
    cameraPos: [0.15, 1.38, 1.75],
    cameraTarget: [0, 1.15, -0.35],
  },
  {
    id: 'colillas',
    titulo: 'Colillas alrededor de sus pies',
    etiqueta: 'Piso · Válvula de escape',
    reflexion:
      'Cada colilla apagada en el suelo marca una noche en vela intentando calmar la cabeza. Cuando el silencio pesa demasiado, buscamos anestesia rápida en lo que nos termina desgastando más.',
    pregunta: '¿A qué recurres en silencio cuando la presión no te deja dormir?',
    cameraPos: [0.65, 0.55, 1.05],
    cameraTarget: [0.05, 0.08, -0.32],
  },
  {
    id: 'zapatos',
    titulo: 'Tenis sucios y desatados',
    etiqueta: 'Piso · Cansancio acumulado',
    reflexion:
      'Ni siquiera se agachó a amarrarse los cordones. Hay días en que el hombre cumple con ir a trabajar, pero por dentro ya camina arrastrando los pasos.',
    pregunta: '¿Cuántos kilómetros llevas caminando en piloto automático?',
    cameraPos: [-0.62, 0.42, 0.92],
    cameraTarget: [0, 0.08, -0.35],
  },
  {
    id: 'silla',
    titulo: 'La silla y la chaqueta caída',
    etiqueta: 'Costado izquierdo',
    reflexion:
      'Llegar a casa, dejar caer la chaqueta y sentarse en la orilla de la silla sin ganas de hablar. Estar rodeado de gente no quita la sensación de estar peleando solo.',
    pregunta: '¿Quién en tu vida sabe realmente cómo estás hoy?',
    cameraPos: [-0.85, 1.12, 1.15],
    cameraTarget: [-1.55, 0.65, -0.95],
  },
  {
    id: 'mesa_recibos',
    titulo: 'Recibos vencidos y cuaderno cerrado',
    etiqueta: 'Mesa de trabajo',
    gremioAfin: 'Comerciantes',
    reflexion:
      'Papeles doblados, cifras tachadas y un cuaderno que ya da miedo abrir. La carga silenciosa de ser el proveedor cuando las cuentas aprietan y el orgullo prohíbe pedir consejo.',
    pregunta: '¿Qué deuda o preocupación financiera estás cargando sin hablarlo?',
    cameraPos: [0.92, 1.35, 0.65],
    cameraTarget: [1.62, 0.82, -0.65],
  },
  {
    id: 'herramientas',
    titulo: 'Caja de herramientas oxidada',
    etiqueta: 'Rincón derecho',
    gremioAfin: 'Mecánicos',
    reflexion:
      'Llaves, destornilladores y grasa en las manos. Estamos entrenados para diagnosticar fallas, ajustar piezas y resolver emergencias ajenas, mientras dejamos oxidar lo que nos pasa por dentro.',
    pregunta: '¿Qué pieza de tu propia vida lleva meses pidiendo reparación?',
    cameraPos: [0.95, 0.78, 1.18],
    cameraTarget: [1.72, 0.22, 0.35],
  },
  {
    id: 'balon',
    titulo: 'Balón desinflado y trofeo viejo',
    etiqueta: 'Rincón izquierdo',
    gremioAfin: 'Futboleros',
    reflexion:
      'En la cancha sobran las bromas, los chistes y los abrazos después de un gol. Pero cuando el partido termina y el balón se desinfla, casi ningún hombre se atreve a decir: «hermano, no puedo más».',
    pregunta: '¿Tienes un compañero de equipo real o solo conocidos de fin de semana?',
    cameraPos: [-1.05, 0.72, 1.32],
    cameraTarget: [-1.85, 0.22, 0.45],
  },
  {
    id: 'celular',
    titulo: 'Celular con mensajes sin responder',
    etiqueta: 'Sobre la mesa',
    reflexion:
      'La pantalla se ilumina con llamadas perdidas y mensajes pendientes. Cientos de contactos en la agenda, pero ni una sola conversación honesta sobre lo que de verdad duele.',
    pregunta: '¿A quién dejaste de responderle porque no querías fingir que estabas bien?',
    cameraPos: [0.85, 1.24, 0.25],
    cameraTarget: [1.55, 0.79, -0.25],
  },
  {
    id: 'cafe',
    titulo: 'Taza de café frío',
    etiqueta: 'Sobre la mesa',
    reflexion:
      'Café preparado hace horas que nadie se terminó. Madrugadas largas pensando en cómo resolver el día siguiente sin mostrar grietas delante de los hijos o la esposa.',
    pregunta: '¿Desde cuándo no descansas de verdad sin sentir culpa?',
    cameraPos: [0.98, 1.25, -0.15],
    cameraTarget: [1.68, 0.83, -0.95],
  },
  {
    id: 'espejo',
    titulo: 'Espejo empañado y agrietado',
    etiqueta: 'Pared izquierda',
    reflexion:
      'Frente al espejo ensayamos la postura derecha, la sonrisa cordial y el saludo firme antes de abrir la puerta. La grieta solo la ve el hombre cuando vuelve a quedarse a solas.',
    pregunta: '¿Qué verías si te quitaras la armadura frente al espejo?',
    cameraPos: [-0.95, 1.52, 0.25],
    cameraTarget: [-2.22, 1.48, -0.35],
  },
  {
    id: 'llaves',
    titulo: 'Llaves sobre la repisa',
    etiqueta: 'Junto a la puerta',
    reflexion:
      'Arrancar temprano, volver tarde, cumplir turnos, responder por todos. Estar siempre en movimiento parece fuerza, pero muchas veces es huida para no quedarse quieto con uno mismo.',
    pregunta: '¿De qué estás huyendo cuando llenas tu agenda de ocupaciones?',
    cameraPos: [-0.25, 1.35, 1.65],
    cameraTarget: [-1.15, 1.15, 2.15],
  },
  {
    id: 'reloj',
    titulo: 'Reloj de pared cansado',
    etiqueta: 'Pared del fondo',
    reflexion:
      'Las horas siguen pasando mientras el peso acumulado se vuelve costumbre. Lo que empezó como una mala racha se convirtió en la manera normal de vivir sin esperanza.',
    pregunta: '¿Cuánto tiempo llevas diciendo «ya se me va a pasar solo»?',
    cameraPos: [0.15, 1.68, 0.85],
    cameraTarget: [0.88, 1.88, -2.18],
  },
  {
    id: 'puerta',
    titulo: 'La puerta cerrada desde adentro',
    etiqueta: 'Pared de salida',
    reflexion:
      'Nadie nos encerró aquí a la fuerza; muchas veces somos nosotros mismos quienes pasamos el cerrojo por orgullo, vergüenza o miedo a parecer débiles delante de otros hombres.',
    pregunta: '¿Qué te impide abrir la puerta y decir «necesito ayuda»?',
    cameraPos: [0.15, 1.38, 1.15],
    cameraTarget: [0.1, 1.15, 2.22],
  },
];

export interface CameraPreset {
  id: string;
  label: string;
  pos: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'frente',
    label: 'Frente al hombre',
    pos: [0.05, 1.38, 2.05],
    target: [0, 1.05, -0.35],
  },
  {
    id: 'general',
    label: 'Toda la habitación',
    pos: [-1.15, 1.72, 2.18],
    target: [0.15, 0.92, -0.45],
  },
  {
    id: 'mesa',
    label: 'Mesa y cuentas',
    pos: [0.55, 1.42, 0.85],
    target: [1.62, 0.84, -0.62],
  },
  {
    id: 'piso',
    label: 'Piso y colillas',
    pos: [0.55, 0.68, 1.18],
    target: [0.0, 0.14, -0.35],
  },
];

export interface CaballeroRegistro {
  id: string;
  nombre: string;
  celular: string;
  gremio: GremioId;
  fechaIso: string;
}

const KEY_CABALLERO = 'dda:caballero';
const KEY_LISTA = 'dda:registros';
const KEY_PROGRESO = 'dda:v1';

export function getSavedCaballero(): CaballeroRegistro | null {
  try {
    const raw = localStorage.getItem(KEY_CABALLERO);
    if (!raw) return null;
    return JSON.parse(raw) as CaballeroRegistro;
  } catch {
    return null;
  }
}

export function saveCaballero(entry: Omit<CaballeroRegistro, 'id' | 'fechaIso'>): CaballeroRegistro {
  const full: CaballeroRegistro = {
    ...entry,
    id: `cab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fechaIso: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY_CABALLERO, JSON.stringify(full));
    const list = getRegistrosList();
    list.unshift(full);
    localStorage.setItem(KEY_LISTA, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
  return full;
}

export function getRegistrosList(): CaballeroRegistro[] {
  try {
    const raw = localStorage.getItem(KEY_LISTA);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(KEY_CABALLERO);
    localStorage.removeItem(KEY_LISTA);
    localStorage.removeItem(KEY_PROGRESO);
  } catch {
    // Ignore
  }
}

export function getDiscoveredObjectIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY_PROGRESO);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.descubiertos) ? parsed.descubiertos : [];
  } catch {
    return [];
  }
}

export function saveDiscoveredObjectIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY_PROGRESO, JSON.stringify({ descubiertos: ids }));
  } catch {
    // Ignore
  }
}

export function exportRegistrosCsv(registros: CaballeroRegistro[]): void {
  const BOM = '\uFEFF';
  const headers = ['Nombre', 'Celular', 'Gremio', 'Fecha de ingreso'];
  const rows = registros.map((r) => {
    const g = GREMIOS.find((item) => item.id === r.gremio)?.nombre ?? r.gremio;
    const fecha = new Date(r.fechaIso).toLocaleString('es-CO');
    return [r.nombre, r.celular, g, fecha]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(';');
  });
  const csvContent = BOM + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `caballeros-el-remanente-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
