// El álbum de pegatinas.
//
// El estado vive en localStorage, como el ranking de los juegos: sin backend
// y sin cuenta. Se guarda un solo objeto con las pegatinas que ya son tuyas,
// cuáles son nuevas (las que aún no has visto en el álbum), y tres contadores.
//
// ponytail: no hay migraciones de formato. Si algún día cambia la forma del
// estado, se borra la clave y se empieza de cero.

import { PEGATINAS, LOGROS, ESTRELLAS_PARA_PEGATINA } from '../components/data/pegatinas';

const CLAVE = 'edutika:pegatinas';

export const ESTADO_INICIAL = {
  pegatinas: [],   // ids de las pegatinas ya ganadas
  nuevas: [],      // ids ganadas que aún no se han visto en el álbum
  partidas: 0,     // partidas terminadas
  estrellasPerfectas: 0, // veces que el niño ha sacado 3 estrellas
  mejorPuntos: 0,  // mejor puntuación del minijuego
};

const leerBruto = () => {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return null;
    return JSON.parse(texto);
  } catch (e) {
    // Sin localStorage (modo privado) o con el JSON corrupto: se empieza de cero.
    return null;
  }
};

const guardar = (estado) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    // Sin localStorage el álbum solo vive en memoria.
  }
  return estado;
};

// El estado guardado, con los campos que falten rellenados.
export function cargarPegatinas() {
  const bruto = leerBruto();
  if (!bruto) return { ...ESTADO_INICIAL };
  return {
    ...ESTADO_INICIAL,
    ...bruto,
    pegatinas: Array.isArray(bruto.pegatinas) ? bruto.pegatinas : [],
    nuevas: Array.isArray(bruto.nuevas) ? bruto.nuevas : [],
  };
}

// Una partida terminada: cuenta para los logros.
export function registrarPartida(estado = cargarPegatinas()) {
  const nuevo = { ...estado, partidas: estado.partidas + 1 };
  return guardar(nuevo);
}

// El resultado del minijuego. Si hay suficientes estrellas, cae una pegatina
// nueva y se anota la partida con tres estrellas.
export function registrarPremio(estrellas, puntos = 0, estado = cargarPegatinas()) {
  const nuevo = {
    ...estado,
    pegatinas: [...estado.pegatinas],
    nuevas: [...estado.nuevas],
    mejorPuntos: Math.max(estado.mejorPuntos, puntos),
  };

  if (estrellas >= ESTRELLAS_PARA_PEGATINA) {
    nuevo.estrellasPerfectas = estado.estrellasPerfectas + 1;
    const ganada = elegirPegatina(nuevo.pegatinas);
    if (ganada) {
      nuevo.pegatinas.push(ganada.id);
      nuevo.nuevas.push(ganada.id);
    }
  }

  return guardar(nuevo);
}

// La siguiente pegatina que todavía no es tuya, al azar entre las que faltan.
export function elegirPegatina(tenidas = []) {
  const faltan = PEGATINAS.filter((p) => !tenidas.includes(p.id));
  if (faltan.length === 0) return null;
  return faltan[Math.floor(Math.random() * faltan.length)];
}

// Marcar como vistas las pegatinas nuevas (al abrir el álbum).
export function limpiarNuevas(estado = cargarPegatinas()) {
  return guardar({ ...estado, nuevas: [] });
}

// Los logros que ya están desbloqueados.
export function logrosDesbloqueados(estado = cargarPegatinas()) {
  return LOGROS.filter((l) => l.cumple(estado));
}

// Cuántas pegatinas hay en total y cuántas faltan.
export function progresoAlbum(estado = cargarPegatinas()) {
  return {总计: PEGATINAS.length, tengo: estado.pegatinas.length};
}
