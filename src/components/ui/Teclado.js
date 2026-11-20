// Un elemento que se pulsa con el ratón también se tiene que poder pulsar
// con el teclado: Enter o Espacio hacen lo mismo que el clic.
//
// ponytail: un helper y un par de atributos, no un componente. Cada sitio
// pone role="button" y tabIndex={0}; esto solo traduce el teclado.

import { css } from 'styled-components';

// El anillo de foco: sin él, el que navega con teclado no sabe dónde está.
export const focoVisible = css`
  &:focus-visible {
    outline: 3px solid var(--brand-teal, #14b8a6);
    outline-offset: 2px;
  }
`;

// El manejador de teclado de esos elementos. La acción recibe el evento,
// por si necesita saber dónde está el elemento (una burbuja, por ejemplo).
export const activarConTeclado = (accion) => (evento) => {
  if (evento.key === 'Enter' || evento.key === ' ') {
    // El espacio, si no, hace scroll a la página.
    evento.preventDefault();
    accion(evento);
  }
};
