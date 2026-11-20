// Mi Huerta.
//
// Una simulación donde la matemática es el motor: si no sabes multiplicar, no
// plantas; si no sabes fracciones, no riegas. El huerto se guarda en el
// navegador, así que sigue mañana.
//
// La lógica (las cuentas del día, el crecimiento, la cosecha) está en
// ./huerta/logic.js. Aquí solo se pinta y se guarda.

import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import {
  Page, TopBar, Volver, Titulo, Tarjeta, Enunciado, Ayuda, Visual, Opciones, Opcion,
  Feedback, Explicacion, Accion, Pastilla, NARANJA, VERDE, ROJO,
} from './ui/JuegoBase';
import {
  DIAS, OBJETIVO_PLANTAS, cerrarDia, etapaDe, faltaParaObjetivo,
  objetivoCumplido, plantar, regar, tareasDelDia, totalPlantas,
} from './huerta/logic';
import { cargarHuerta, guardarHuerta, reiniciarHuerta } from '../utils/huerta';

const Jardin = styled.div`
  position: relative;
  border-radius: 18px;
  padding: 1rem 0.8rem 0.8rem;
  min-height: 190px;
  background: ${(props) => (props.$noche
    ? 'linear-gradient(180deg, #16243d 0%, #1d3557 60%, #3b2b1f 60%, #6b4a2f 100%)'
    : 'linear-gradient(180deg, #bfe6ff 0%, #e9f8ff 55%, #3b2b1f 55%, #6b4a2f 100%)')};
  border: 2px solid rgba(11, 43, 69, 0.15);
  overflow: hidden;
`;

const Cielo = styled.img`
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  width: 42px;
  height: 42px;
`;

const Camas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: flex-end;
  padding-top: 2.2rem;
  max-height: 240px;
  overflow-y: auto;
`;

// Las keyframes se declaran fuera: si se crean dentro de la interpolación,
// cada repintado genera una animación nueva y las plantas nunca paran de
// saltar.
const aparecer = keyframes`
  from { transform: translateY(-14px) scale(0.6); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

const Planta = styled.img`
  width: 34px;
  height: 34px;
  animation: ${(props) => (props.$nueva ? aparecer : 'none')} 0.4s ease;
`;

const Vacio = styled.p`
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  font-weight: 700;
`;

const RegarAnimacion = keyframes`
  0% { transform: translateX(-40px) rotate(-18deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(120px) rotate(10deg); opacity: 0; }
`;

const Regando = styled.img`
  position: absolute;
  top: 0.4rem;
  left: 0;
  width: 64px;
  height: 64px;
  animation: ${RegarAnimacion} 1.4s ease forwards;
  pointer-events: none;
`;

const Goteo = styled.img`
  position: absolute;
  top: 2.6rem;
  left: 3.2rem;
  width: 20px;
  height: 20px;
  animation: ${keyframes`
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(90px); opacity: 0; }
  `} 0.7s linear infinite;
  pointer-events: none;
`;

const FilaPastillas = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
`;

const HuertaGame = ({ onBack }) => {
  const [estado, setEstado] = useState(() => cargarHuerta());
  const [elegido, setElegido] = useState(null);
  const [regando, setRegando] = useState(false);
  const temporizador = useRef(null);
  // El estado también en una ref: el temporizador del riego necesita el
  // estado de ese momento y no el que había al pulsar el botón.
  const estadoRef = useRef(estado);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Guarda el estado. Acepta un valor o una función que lo calcula a partir
  // del estado actual.
  const guardar = (nuevo) => {
    const siguiente = typeof nuevo === 'function' ? nuevo(estadoRef.current) : nuevo;
    estadoRef.current = siguiente;
    setEstado(siguiente);
    guardarHuerta(siguiente);
  };

  const tareas = estado.tareas;
  const fase = estado.fase;
  // Cinturón: si la fase necesita las cuentas del día y no las hay (un
  // guardado de una versión antigua), se vuelve al inicio en vez de
  // quedarse en blanco.
  const faseSegura = (fase === 'plantar' || fase === 'regar') && !tareas ? 'inicio' : fase;
  const falta = faltaParaObjetivo(estado);

  // --- Acciones -----------------------------------------------------------

  const empezarDia = () => {
    guardar({
      ...estado,
      tareas: tareasDelDia(estado.dia, Math.random),
      fase: 'plantar',
    });
    setElegido(null);
  };

  const responderPlantar = (opcion) => {
    if (elegido !== null) return;
    setElegido(opcion);
    if (opcion === tareas.plantar.total) {
      // La fase no cambia todavía: primero el niño ve el acierto y la
      // explicación, y al pulsar "Continuar" es cuando se plantan.
      guardar({ ...estado, plantado: true });
    }
  };

  const responderRegar = (opcion) => {
    if (elegido !== null) return;
    setElegido(opcion);
    if (opcion === tareas.regar.botellas) {
      guardar({ ...regar(estado, tareas.regar.botellas), regado: true });
    }
  };

  const pasarARegar = () => {
    setElegido(null);
    guardar({
      ...plantar(estado, estado.dia, tareas.plantar.total),
      fase: 'regar',
    });
  };

  const regarAhora = () => {
    // Si el niño pulsa dos veces, se cancela el temporizador anterior: si no,
    // se quedarían dos writes con el estado viejo.
    clearTimeout(temporizador.current);
    setRegando(true);
    temporizador.current = setTimeout(() => {
      setRegando(false);
      // Se usa el estado del momento, no el que había al pulsar: si el niño
      // ha tocado algo mientras se riega, no se pisa.
      guardar((prev) => ({ ...prev, fase: 'crecer' }));
    }, 1400);
  };

  const empezarManana = () => {
    const siguiente = cerrarDia(estado, estado.dia);
    guardar({
      ...siguiente,
      tareas: null,
      plantado: false,
      regado: false,
      fase: siguiente.terminado ? 'final' : 'inicio',
    });
    setElegido(null);
  };

  const empezarDeNuevo = () => {
    setElegido(null);
    guardar(reiniciarHuerta());
  };

  // --- Pintar -------------------------------------------------------------

  const plantas = estado.plantones.flatMap((p) =>
    Array.from({ length: p.cantidad }, (_, i) => ({
      clave: `${p.dia}-${i}`,
      dia: p.dia,
      nueva: p.dia === estado.dia && estado.plantado,
    }))
  );

  const jardin = (noche) => (
    <Jardin $noche={noche}>
      <Cielo src={`${process.env.PUBLIC_URL}/huerto/${noche ? 'luna' : 'sol'}.svg`} alt="" />
      {plantas.length === 0 ? (
        <Vacio>El huerto está vacío. ¡Planta algo!</Vacio>
      ) : (
        <Camas>
          {plantas.map((p) => (
            <Planta
              key={p.clave}
              $nueva={p.nueva}
              src={`${process.env.PUBLIC_URL}/huerto/${etapaDe(p.dia, estado.dia)}.svg`}
              alt=""
            />
          ))}
        </Camas>
      )}
      {regando && (
        <>
          <Regando src={`${process.env.PUBLIC_URL}/huerto/regadera.svg`} alt="" />
          <Goteo src={`${process.env.PUBLIC_URL}/huerto/gota.svg`} alt="" />
        </>
      )}
    </Jardin>
  );

  const barra = (
    <TopBar>
      <Volver type="button" onClick={onBack}>
        <FaArrowLeft /> Volver
      </Volver>
      <Titulo>Mi Huerta</Titulo>
      <Pastilla $tono={NARANJA}>Día {Math.min(estado.dia, DIAS)} de {DIAS}</Pastilla>
      <Pastilla $tono={VERDE}>Plantas: {totalPlantas(estado)}</Pastilla>
      <Pastilla $tono={NARANJA}>Monedas: {estado.monedas}</Pastilla>
    </TopBar>
  );

  // Pantalla de una cuenta (plantar o regar).
  const cuenta = (tarea, correcta, alResponder, alContinuar, explicacion) => {
    const acierto = elegido === correcta;
    const fallo = elegido !== null && !acierto;
    return (
      <Tarjeta>
        <Enunciado>{tarea.enunciado}</Enunciado>
        <Ayuda>{tarea.ayuda}</Ayuda>
        <Opciones>
          {tarea.opciones.map((opcion) => (
            <Opcion
              key={opcion}
              type="button"
              disabled={elegido !== null}
              $acierto={elegido !== null && opcion === correcta}
              $fallo={fallo && opcion === elegido}
              onClick={() => alResponder(opcion)}
            >
              {opcion}
            </Opcion>
          ))}
        </Opciones>
        {elegido !== null && (
          <>
            <Feedback $color={acierto ? VERDE : ROJO}>
              {acierto ? '¡Correcto!' : 'No es esa. ¡Inténtalo otra vez!'}
            </Feedback>
            <Explicacion>{explicacion(acierto)}</Explicacion>
            {acierto ? (
              <Accion type="button" onClick={alContinuar}>
                Continuar
              </Accion>
            ) : (
              <Accion type="button" onClick={() => setElegido(null)}>
                Volver a intentarlo
              </Accion>
            )}
          </>
        )}
      </Tarjeta>
    );
  };

  if (faseSegura === 'plantar') {
    const t = tareas.plantar;
    return (
      <Page>
        {barra}
        {jardin(false)}
        {cuenta(
          t,
          t.total,
          responderPlantar,
          pasarARegar,
          (acierto) => (acierto
            ? `${t.filas} filas de ${t.columnas} plantones son ${t.total} plantones.`
            : `Multiplica las filas por las columnas: ${t.filas} × ${t.columnas}. Repasa la tabla del ${t.filas} y la del ${t.columnas}.`)
        )}
      </Page>
    );
  }

  if (faseSegura === 'regar') {
    const t = tareas.regar;
    return (
      <Page>
        {barra}
        {jardin(false)}
        {cuenta(
          t,
          t.botellas,
          responderRegar,
          regarAhora,
          (acierto) => (acierto
            ? `${t.plantas} plantas × ${t.fraccion.numerador}/${t.fraccion.denominador} de botella = ${t.botellas} botellas.`
            : `Cada planta bebe ${t.fraccion.numerador}/${t.fraccion.denominador} de botella. Multiplica las plantas por esa fracción.`)
        )}
      </Page>
    );
  }

  if (faseSegura === 'crecer') {
    const plantasDelDia = estado.plantones
      .filter((p) => p.dia === estado.dia)
      .reduce((s, p) => s + p.cantidad, 0);
    return (
      <Page>
        {barra}
        <Tarjeta>
          <Enunciado>🌙 Las plantas han crecido</Enunciado>
          {jardin(true)}
          <Visual>
            <Pastilla $tono={VERDE}>
              Mañana habrá {plantasDelDia} plantas y ganarás {plantasDelDia} monedas
            </Pastilla>
          </Visual>
          <Explicacion>
            Mañana las plantas будут un paso más grandes: de semilla a brote, de brote
            a planta y de planta a fruto.
          </Explicacion>
          <Accion type="button" onClick={empezarManana}>
            {estado.dia >= DIAS ? 'Ver el huerto' : `Empezar el día ${estado.dia + 1}`}
          </Accion>
        </Tarjeta>
      </Page>
    );
  }

  if (faseSegura === 'final') {
    const completo = objetivoCumplido(estado);
    return (
      <Page>
        {barra}
        <Tarjeta>
          <Enunciado>{completo ? '🏆 ¡Huerto lleno!' : '🌾 ¡Has cuidado el huerto!'}</Enunciado>
          {jardin(false)}
          <FilaPastillas>
            <Pastilla $tono={VERDE}>Plantas: {totalPlantas(estado)}</Pastilla>
            <Pastilla $tono={NARANJA}>Monedas: {estado.monedas}</Pastilla>
          </FilaPastillas>
          <Explicacion>
            {completo
              ? `¡Huerto lleno! ${OBJETIVO_PLANTAS} plantas y ${estado.monedas} monedas.`
              : `El objetivo era llegar a ${OBJETIVO_PLANTAS} plantas. Te faltaron ${falta.plantas}.`}
          </Explicacion>
          <Accion type="button" onClick={empezarDeNuevo}>
            Empezar un huerto nuevo
          </Accion>
        </Tarjeta>
      </Page>
    );
  }

  // Pantalla de inicio: el huerto y lo que falta.
  return (
    <Page>
      {barra}
      <Tarjeta>
        <Enunciado>🌻 Tu huerto</Enunciado>
        {jardin(false)}
        <FilaPastillas>
          <Pastilla $tono={VERDE}>Plantas: {totalPlantas(estado)}</Pastilla>
          <Pastilla $tono={NARANJA}>Monedas: {estado.monedas}</Pastilla>
        </FilaPastillas>
        <Explicacion>
          Objetivo: llenar el huerto de {OBJETIVO_PLANTAS} plantas. Te faltan{' '}
          {falta.plantas}. Cada planta te da una moneda al crecer.
        </Explicacion>
        <Accion type="button" onClick={empezarDia}>
          Cuidar el huerto
        </Accion>
      </Tarjeta>
    </Page>
  );
};

export default HuertaGame;
