// El lector de PNG vive en scripts/png.mjs (que tambien sabe escribir) y
// aqui se reexporta para los tests.
export { leerPNG as leer, escribirPNG } from '../../scripts/png.mjs';
