export const canchasIniciales = [
  {
    id: 1,
    titulo: 'Estadio Principal - Fútbol 11',
    tipo: 'Fútbol 11',
    superficie: 'Grama Natural Pro',
    precio: '$60.000',
    tarifa: 60000,
    capacidad: 22,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1665113721297-dfa3f38de996?q=80&w=687&auto=format&fit=crop',
    descripcion: 'Nuestra joya del complejo. Una cancha con medidas oficiales óptima para partidos grandes...',
    detalles: [
      'Capacidad ideal: 22 jugadores',
      'Graderías laterales para acompañantes',
      'Incluye petos de entrenamiento y balones oficiales',
    ],
  },
  {
    id: 2,
    titulo: 'Coliseo Multi-deporte Cubierto',
    tipo: 'Fútbol Sala / Baloncesto',
    superficie: 'Madera Pulida / PVC',
    precio: '$45.000',
    tarifa: 45000,
    capacidad: 10,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format',
    descripcion: 'Espacio totalmente techado y protegido del clima...',
    detalles: [
      'Tableros de baloncesto hidráulicos ajustables',
      'Excelente ventilación e iluminación cenital',
      'Arcos de fútsal con mallas reforzadas',
    ],
  },
  {
    id: 3,
    titulo: 'Cancha de Tenis - Pista Rápida',
    tipo: 'Tenis',
    superficie: 'Superficie Sintética Rápida',
    precio: '$35.000',
    tarifa: 35000,
    capacidad: 4,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format',
    descripcion: 'Diseñada para amantes de la velocidad y precisión...',
    detalles: [
      'Excelente rebote controlado de bola',
      'Entorno libre de ruidos disruptivos',
      'Alquiler disponible de raquetas y tubos de bolas',
    ],
  },
  {
    id: 4,
    titulo: 'Cancha de Pádel Azul Celeste',
    tipo: 'Pádel',
    superficie: 'Vidrio Templado Panorámico',
    precio: '$40.000',
    tarifa: 40000,
    capacidad: 4,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format',
    descripcion: 'Disfruta del deporte con mayor crecimiento mundial...',
    detalles: [
      'Estructura panorámica de alta visibilidad',
      'Iluminación LED antideslumbrante orientada al cielo',
      'Zona de descanso integrada para hidratación',
    ],
  },
  {
    id: 5,
    titulo: 'Espacio de Entrenamiento Indoor',
    tipo: 'Entrenamiento Indoor',
    superficie: 'Piso de Concreto Pulido Técnico',
    precio: '$25.000',
    tarifa: 25000,
    capacidad: 12,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1781786501670-82355e5b12c4?q=80&w=1470&auto=format&fit=crop',
    descripcion: 'Diseñada especialmente para sesiones enfocadas en la técnica...',
    detalles: [
      'Excelente acústica y concentración',
      'Redes de aro en nylon de alta densidad',
      'Ideal para prácticas libres o rutinas físicas',
    ],
  },
];

const CANCHAS_KEY = 'canchas_data';

export function obtenerCanchas() {
  const data = localStorage.getItem(CANCHAS_KEY);
  if (!data) {
    localStorage.setItem(CANCHAS_KEY, JSON.stringify(canchasIniciales));
    return canchasIniciales;
  }
  return JSON.parse(data);
}

export function guardarCanchas(canchas) {
  localStorage.setItem(CANCHAS_KEY, JSON.stringify(canchas));
}
