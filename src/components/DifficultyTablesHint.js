import React from 'react';
import { tablesHint } from '../utils/problemGenerator';

// Muestra debajo de cada botón de dificultad qué tablas se van a practicar.
// El niño elige tablas antes de entrar, y la dificultad puede recortarlas:
// sin este texto, "Tablas: 15, 16, 17" en la configuración y luego cuentas
// del 2 al 9 en fácil, sin explicación.
export default function DifficultyTablesHint({ multiplicationConfig, difficulty }) {
  const texto = tablesHint(multiplicationConfig, difficulty);
  if (!texto) return null;
  return (
    <div style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.9, marginTop: '0.2rem' }}>
      {texto}
    </div>
  );
}
