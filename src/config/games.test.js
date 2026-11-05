// El catálogo de src/config/games.js es la única lista de juegos. Estos tests
// comprueban que sigue siendo coherente con el resto del repo, que es
// justamente el fallo que pasaba antes: añadir un juego obligaba a tocar tres
// ficheros y olvidar uno dejaba un juego que no se podía abrir.

import fs from 'fs';
import path from 'path';
import { render } from '@testing-library/react';
import GameSelector from '../components/GameSelector';
import { GAMES, CATEGORIES, gamesByCategory, gameDescription } from './games';

const raizApp = path.resolve(__dirname, '..');
const leer = (rel) => fs.readFileSync(path.join(raizApp, rel), 'utf8');

describe('catálogo de juegos', () => {
  it('no tiene ids repetidos', () => {
    const ids = GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los juegos tienen id, título, color, icono y descripción', () => {
    for (const g of GAMES) {
      expect(typeof g.id).toBe('string');
      expect(g.title.length).toBeGreaterThan(0);
      expect(g.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(g.icon).toBeTruthy();
      expect(typeof g.description === 'string' || typeof g.description === 'function').toBe(true);
      // Un juego directo no tiene categoría; el resto, al menos una.
      if (!g.direct) expect(g.categories.length).toBeGreaterThan(0);
    }
  });

  it('todo juego del catálogo tiene su vista en App.js', () => {
    const app = leer('App.js');
    const sinRuta = GAMES.filter((g) => !app.includes(`case '${g.id}':`));
    expect(sinRuta.map((g) => g.id)).toEqual([]);
  });

  it('toda vista de juego de App.js está en el catálogo', () => {
    const app = leer('App.js');
    const vistas = [...app.matchAll(/case '([a-zA-Z]+)':\s*\n\s*return <(\w+)/g)]
      .map((m) => ({ vista: m[1], componente: m[2] }));
    const idsCatalogo = new Set(GAMES.map((g) => g.id));
    // Las vistas que no son juegos: la landing, el selector y las pantallas
    // intermedias.
    const sinJuego = ['landing', 'game-selector', 'multiplication-config'];
    const huerfanas = vistas
      .filter((v) => !idsCatalogo.has(v.vista) && !sinJuego.includes(v.vista))
      .map((v) => `${v.vista} (${v.componente})`);
    expect(huerfanas).toEqual([]);
  });

  it('cada categoría de un juego tiene su actividad en la landing', () => {
    const catsLanding = new Set(CATEGORIES.map((c) => c.category).filter(Boolean));
    for (const g of GAMES) {
      for (const cat of g.categories) {
        expect(catsLanding.has(cat)).toBe(true);
      }
    }
  });

  it('toda actividad de la landing tiene al menos un juego', () => {
    for (const c of CATEGORIES) {
      if (c.view) {
        // Un juego que se abre directo: no necesita categoría.
        expect(GAMES.some((g) => g.id === c.view)).toBe(true);
        continue;
      }
      expect(gamesByCategory(c.category).length).toBeGreaterThan(0);
    }
  });

  it('los juegos directos no salen en el selector', () => {
    for (const g of GAMES.filter((x) => x.direct)) {
      for (const c of CATEGORIES.map((x) => x.category).filter(Boolean)) {
        expect(gamesByCategory(c)).not.toContain(g);
      }
    }
  });

  it('los ids de las actividades son únicos', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('la multiplicación pasa por la pantalla de configuración', () => {
    const mult = CATEGORIES.find((c) => c.category === 'multiplication');
    expect(mult).toBeTruthy();
    // Y el selector de juegos existe como vista para el resto.
    expect(leer('App.js')).toContain("case 'multiplication-config':");
  });
});

describe('descripciones', () => {
  it('la función recibe la acción de la categoría', () => {
    const memory = GAMES.find((g) => g.id === 'memory');
    expect(gameDescription(memory, 'sumando')).toContain('sumando');
  });

  it('un texto fijo se devuelve tal cual', () => {
    const tower = GAMES.find((g) => g.id === 'knowledgetower');
    expect(gameDescription(tower, 'sumando')).toBe(tower.description);
  });

  it('ninguna descripción queda vacía', () => {
    for (const g of GAMES) {
      expect(gameDescription(g, 'jugando').length).toBeGreaterThan(0);
    }
  });
});

describe('el selector de juegos', () => {
  const montar = (category) =>
    render(<GameSelector category={category} onNavigate={() => {}} />);

  it('enseña los juegos de la categoría', () => {
    const { getByText } = montar('multiplication');
    for (const g of gamesByCategory('multiplication')) {
      expect(getByText(g.title)).toBeTruthy();
    }
  });

  it('enseña el icono de cada juego', () => {
    const { container } = montar('knowledge');
    // Cada tarjeta lleva un svg del icono.
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('no enseña juegos de otra categoría', () => {
    const { queryByText } = montar('puzzles');
    expect(queryByText('Torre del Saber')).toBeNull();
  });

  it('PokemonMaths no aparece en multiplicación', () => {
    const { queryByText } = montar('multiplication');
    expect(queryByText('PokemonMaths')).toBeNull();
  });
});
