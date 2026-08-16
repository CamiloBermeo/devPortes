export function formatoTipo(cancha) {
  if (Array.isArray(cancha.tipo)) return cancha.tipo.join(' • ');
  return cancha.tipo || '';
}

export function tipoAArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor.trim()) return [valor.trim()];
  return [];
}

export const canchasIniciales = [
  {
    id: 1,
    titulo: 'Estadio Principal',
    tipo: ['Fútbol 11'],
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
    titulo: 'Coliseo Multi-deporte',
    tipo: ['Fútbol Sala', 'Baloncesto'],
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
    titulo: 'Club de Tenis Las Palmas',
    tipo: ['Tenis'],
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
    titulo: 'Pádel Arena Celeste',
    tipo: ['Pádel'],
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
    titulo: 'Zona de Entrenamiento',
    tipo: ['Cancha Indoor'],
    superficie: 'Piso de Concreto',
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
  {
    id: 6,
    titulo: 'La Catedral del Basket',
    tipo: ['Baloncesto', 'Básquetbol 3x3'],
    superficie: 'Madera Deportiva',
    precio: '$30.000',
    tarifa: 30000,
    capacidad: 10,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format',
    descripcion: 'Espacio techado con pista reglamentaria y zona 3x3 para partidos rápidos...',
    detalles: [
      'Tableros homologados con red reglamentaria',
      'Iluminación LED de alta intensidad',
      'Marcador electrónico digital integrado',
    ],
  },
  {
    id: 7,
    titulo: 'Olas del Norte',
    tipo: ['Vóley Playa', 'Vóley Indoor'],
    superficie: 'Arena Sintética',
    precio: '$28.000',
    tarifa: 28000,
    capacidad: 12,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format',
    descripcion: 'Cancha de vóley con arena sintética de alta calidad y red reglamentaria...',
    detalles: [
      'Arena sintética certificada para competencia',
      'Red ajustable para playa o indoor',
      'Sector de calentamiento lateral',
    ],
  },
  {
    id: 8,
    titulo: 'El Potrero Sintético',
    tipo: ['Fútbol 7', 'Futsal'],
    superficie: 'Césped Sintético 4G',
    precio: '$38.000',
    tarifa: 38000,
    capacidad: 14,
    estado: 'Mantenimiento',
    imagen: 'https://images.unsplash.com/photo-1665113721297-dfa3f38de996?q=80&w=687&auto=format&fit=crop',
    descripcion: 'Cancha sintética con dimensiones oficiales de fútbol 7, en mantenimiento preventivo...',
    detalles: [
      'Césped sintético de última generación 4G',
      'Dimensiones reglamentarias FIFA',
      'Actualmente en mantenimiento preventivo del césped',
    ],
  },
  {
    id: 9,
    titulo: 'Los Cristales Pádel Club',
    tipo: ['Pádel', 'Pádel Cross'],
    superficie: 'Cristal Templado Panorámico',
    precio: '$42.000',
    tarifa: 42000,
    capacidad: 4,
    estado: 'Disponible',
    imagen: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format',
    descripcion: 'Club de pádel con estructura panorámica y zona para pádel cross...',
    detalles: [
      'Muro panorámico sin perfiles verticales',
      'Iluminación cenital homologada',
      'Zona adaptada para pádel cross y entrenamiento',
    ],
  },
  {
    id: 10,
    titulo: 'Tierra y Red',
    tipo: ['Tenis', 'Tenis de Mesa'],
    superficie: 'Polvo de Ladrillo',
    precio: '$32.000',
    tarifa: 32000,
    capacidad: 4,
    estado: 'Mantenimiento',
    imagen: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format',
    descripcion: 'Cancha de tenis con superficie de polvo de ladrillo en renovación...',
    detalles: [
      'Superficie de arcilla roja natural',
      'Red reglamentaria con poste de acero',
      'Actualmente en proceso de nivelación del court',
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
