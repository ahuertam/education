// Los ajustes del aula.
//
// Un educador puede querer quitar el minijuego de premio: en una sesión
// programada, lo que interesa es la práctica, no el regalo. El ajuste se
// guarda en el navegador y se aplica a todos los juegos.
//
// ponytail: un solo ajuste y un solo archivo. Si algún día hay más, se
// añaden campos al mismo objeto.

const CLAVE = 'edutika:ajustes';

export const AJUSTES_INICIALES = {
  // El minijuego de premio (y con él, las pegatinas) está encendido.
  premio: true,
};

// El interruptor tiene que ser un booleano de verdad: si un guardado
// tuviera "false" como texto en vez de false, el checkbox se quedaría
// pillado. Solo se apaga con false (o su texto).
const aBooleano = (v) => v !== false && v !== 'false';

export function cargarAjustes() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return { ...AJUSTES_INICIALES };
    const datos = JSON.parse(texto);
    if (!datos || typeof datos !== 'object') return { ...AJUSTES_INICIALES };
    return {
      ...AJUSTES_INICIALES,
      ...datos,
      premio: aBooleano(datos.premio),
    };
  } catch (e) {
    // Sin localStorage o con el JSON corrupto: los ajustes por defecto.
    return { ...AJUSTES_INICIALES };
  }
}

export function guardarAjustes(ajustes) {
  const nuevo = { ...AJUSTES_INICIALES, ...ajustes, premio: aBooleano(ajustes.premio) };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch (e) {
    // Sin localStorage el ajuste solo vive en esta sesión.
  }
  return nuevo;
}

// ¿Se muestra el minijuego de premio al terminar una partida?
export function premioActivado() {
  return cargarAjustes().premio;
}
