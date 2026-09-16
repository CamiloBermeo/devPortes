export const USE_MOCK = false;

const CANCHAS_KEY = 'canchas_data';

export const canchasIniciales = [
  {
    id: 1,
    titulo: 'Estadio Principal',
    tipo: ['Futbol 11'],
    superficie: 'Grama Natural Pro',
    precio: '$60.000',
    tarifa: 60000,
    capacidad: 22,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/futbol-estadio-principal.webp',
    descripcion: 'Nuestra joya del complejo. Una cancha con medidas oficiales optima para partidos grandes...',
    detalles: [
      'Capacidad ideal: 22 jugadores',
      'Graderias laterales para acompanantes',
      'Incluye petos de entrenamiento y balones oficiales',
    ],
  },
  {
    id: 2,
    titulo: 'Coliseo Multi-deporte',
    tipo: ['Futbol Sala', 'Baloncesto'],
    superficie: 'Madera Pulida / PVC',
    precio: '$45.000',
    tarifa: 45000,
    capacidad: 10,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/baloncesto-coliseo.webp',
    descripcion: 'Espacio totalmente techado y protegido del clima...',
    detalles: [
      'Tableros de baloncesto hidraulicos ajustables',
      'Excelente ventilacion e iluminacion cenital',
      'Arcos de futsal con mallas reforzadas',
    ],
  },
  {
    id: 3,
    titulo: 'Club de Tenis Las Palmas',
    tipo: ['Tenis'],
    superficie: 'Superficie Sintetica Rapida',
    precio: '$35.000',
    tarifa: 35000,
    capacidad: 4,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/tenis-las-palmas.webp',
    descripcion: 'Disenada para amantes de la velocidad y precision...',
    detalles: [
      'Excelente rebote controlado de bola',
      'Entorno libre de ruidos disruptivos',
      'Alquiler disponible de raquetas y tubos de bolas',
    ],
  },
  {
    id: 4,
    titulo: 'Padel Arena Celeste',
    tipo: ['Padel'],
    superficie: 'Vidrio Templado Panoramico',
    precio: '$40.000',
    tarifa: 40000,
    capacidad: 4,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/padel-arena.webp',
    descripcion: 'Disfruta del deporte con mayor crecimiento mundial...',
    detalles: [
      'Estructura panoramica de alta visibilidad',
      'Iluminacion LED antideslumbrante orientada al cielo',
      'Zona de descanso integrada para hidratacion',
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
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/indoor-entrenamiento.webp',
    descripcion: 'Disenada especialmente para sesiones enfocadas en la tecnica...',
    detalles: [
      'Excelente acustica y concentracion',
      'Redes de aro en nylon de alta densidad',
      'Ideal para practicas libres o rutinas fisicas',
    ],
  },
  {
    id: 6,
    titulo: 'La Catedral del Basket',
    tipo: ['Baloncesto', 'Basquetbol 3x3'],
    superficie: 'Madera Deportiva',
    precio: '$30.000',
    tarifa: 30000,
    capacidad: 10,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/baloncesto-coliseo.webp',
    descripcion: 'Espacio techado con pista reglamentaria y zona 3x3 para partidos rapidos...',
    detalles: [
      'Tableros homologados con red reglamentaria',
      'Iluminacion LED de alta intensidad',
      'Marcador electronico digital integrado',
    ],
  },
  {
    id: 7,
    titulo: 'Olas del Norte',
    tipo: ['Voley Playa', 'Voley Indoor'],
    superficie: 'Arena Sintetica',
    precio: '$28.000',
    tarifa: 28000,
    capacidad: 12,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/padel-arena.webp',
    descripcion: 'Cancha de voley con arena sintetica de alta calidad y red reglamentaria...',
    detalles: [
      'Arena sintetica certificada para competencia',
      'Red ajustable para playa o indoor',
      'Sector de calentamiento lateral',
    ],
  },
  {
    id: 8,
    titulo: 'El Potrero Sintetico',
    tipo: ['Futbol 7', 'Futsal'],
    superficie: 'Cesped Sintetico 4G',
    precio: '$38.000',
    tarifa: 38000,
    capacidad: 14,
    estado: 'Mantenimiento',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/futbol-estadio-principal.webp',
    descripcion: 'Cancha sintetica con dimensiones oficiales de futbol 7, en mantenimiento preventivo...',
    detalles: [
      'Cesped sintetico de ultima generacion 4G',
      'Dimensiones reglamentarias FIFA',
      'Actualmente en mantenimiento preventivo del cesped',
    ],
  },
  {
    id: 9,
    titulo: 'Los Cristales Padel Club',
    tipo: ['Padel', 'Padel Cross'],
    superficie: 'Cristal Templado Panoramico',
    precio: '$42.000',
    tarifa: 42000,
    capacidad: 4,
    estado: 'Disponible',
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/padel-arena.webp',
    descripcion: 'Club de padel con estructura panoramica y zona para padel cross...',
    detalles: [
      'Muro panoramico sin perfiles verticales',
      'Iluminacion cenital homologada',
      'Zona adaptada para padel cross y entrenamiento',
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
    imagen: 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/canchas/tenis-las-palmas.webp',
    descripcion: 'Cancha de tenis con superficie de polvo de ladrillo en renovacion...',
    detalles: [
      'Superficie de arcilla roja natural',
      'Red reglamentaria con poste de acero',
      'Actualmente en proceso de nivelacion del court',
    ],
  },
];

export function obtenerCanchasMock() {
  const data = localStorage.getItem(CANCHAS_KEY);
  if (!data) {
    localStorage.setItem(CANCHAS_KEY, JSON.stringify(canchasIniciales));
    return canchasIniciales;
  }
  return JSON.parse(data);
}

export function guardarCanchasMock(canchas) {
  localStorage.setItem(CANCHAS_KEY, JSON.stringify(canchas));
}
