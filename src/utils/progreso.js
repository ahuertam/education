// El progreso del niño: qué juegos ha probado.
//
// No es una puntuación ni un bloqueo: es un espejo. En la landing se ve
// cuántos de los juegos del catálogo se han probado ya, para que un niño
// vea que le quedan cosas por descubrir.
//
// El estado se guarda en localStorage, como el álbum y los rankings.
//
// ponytail: se anota el juego al abrirlo, no al terminarlo. Así no hay que
// tocar los 41 juegos para nada: App.js ya sabe qué juego se está abriendo.

const CLAVE = 'edutika:progreso';

const leer = () => {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return [];
    const datos = JSON.parse(texto);
    return Array.isArray(datos) ? datos : [];
  } catch (e) {
    return [];
  }
};

const guardar = (jugados) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(jugados));
  } catch (e) {
    // Sin localStorage el progreso solo vive en esta sesión.
  }
  return jugados;
};

// Anota que se ha abierto un juego.
export function registrarJuegoJugado(gameId) {
  if (!gameId) return leer();
  const jugados = leer();
  if (jugados.includes(gameId)) return jugados;
  return guardar([...jugados, gameId]);
}

// Los ids de los juegos que ya se han abierto.
export function cargarProgreso() {
  return leer();
}

// Cuántos juegos del catálogo se han probado, en total y por categoría.
export function progresoPorCategoria(games) {
  const jugados = new Set(leer());
  const porCategoria = {};
  games.forEach((g) => {
    g.categories.forEach((c) => {
      if (!porCategoria[c]) porCategoria[c] = { jugados: 0, total: 0 };
      porCategoria[c].total += 1;
      if (jugados.has(g.id)) porCategoria[c].jugados += 1;
    });
  });
  return {
    jugados: games.filter((g) => jugados.has(g.id)).length,
    // Todos los juegos del catálogo cuentan, también el que se abre directo
    // desde la landing (la mazmorra de tecleo), que no tiene categoría.
    total: games.length,
    porCategoria,
  };
}
