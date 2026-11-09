// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom no reproduce audio: play() devuelve undefined y no lanza, así que los
// juegos que hacen `audio.play().catch(...)` se rompen al montarlos en un
// test. Aquí se deja como en un navegador: devuelve una promesa.
//
// Ojo: tiene que ser una función normal y no jest.fn(), porque CRA pone
// resetMocks y eso le vacía la implementación al mock.
if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
  window.HTMLMediaElement.prototype.load = () => {};
}
