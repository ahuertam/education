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

export function cargarAjustes() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return { ...AJUSTES_INICIALES };
    return { ...AJUSTES_INICIALES, ...JSON.parse(texto) };
  } catch (e) {
    // Sin localStorage o con el JSON corrupto: los ajustes por defecto.
    return { ...AJUSTES_INICIALES };
  }
}

export function guardarAjustes(ajustes) {
  const nuevo = { ...AJUSTES_INICIALES, ...ajustes };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch (e) {
    // Sin localStorage el ajuste solo vive en esta sesión.
  }
  return nuevo;
}

// ¿Se muestra el minijuego de premio al terminar una partida?
export function premioActivado() {
  return cargarAjustes().premio !== false;
}
