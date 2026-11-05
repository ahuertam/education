import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';
import { CATEGORIES as TODAS } from './data/knowledgeTowerCategories';
import QUESTIONS from './data/knowledgeTowerQuestions.json';

const VALORES = [100, 200, 300, 400];
const COLUMNAS = 5;

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 2rem;
  background: linear-gradient(170deg, #101a3a 0%, #06091c 100%);
  color: #fdf6e3;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fdf6e3;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;

  &:hover { background: rgba(255, 255, 255, 0.18); }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.6rem;
`;

const Puntos = styled.div`
  font-weight: bold;
  font-size: 1.05rem;
`;

const Tablero = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(${COLUMNAS}, 1fr);
  gap: 0.5rem;

  @media (max-width: 720px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Cabecera = styled.div`
  background: ${(props) => props.$color};
  color: #101a3a;
  border-radius: 10px;
  padding: 0.6rem 0.4rem;
  font-weight: bold;
  text-align: center;
  font-size: 0.95rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Casilla = styled.button`
  background: ${(props) => (props.$usada ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.13)')};
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: ${(props) => (props.$usada ? 'rgba(253,246,227,0.35)' : '#fdf6e3')};
  border-radius: 10px;
  padding: 1rem 0.3rem;
  font-size: 1.15rem;
  font-weight: bold;
  cursor: ${(props) => (props.$usada ? 'default' : 'pointer')};
  font-family: inherit;
  min-height: 3.4rem;

  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.26); }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(3, 5, 15, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
`;

const Panel = styled.div`
  background: #101a3a;
  border: 2px solid rgba(255, 200, 87, 0.5);
  border-radius: 18px;
  padding: 1.5rem;
  max-width: 640px;
  width: 100%;
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
`;

const Valor = styled.div`
  font-size: 1.1rem;
  color: #ffc857;
  font-weight: bold;
  margin-bottom: 0.8rem;
`;

const Pregunta = styled.p`
  font-size: 1.35rem;
  line-height: 1.5;
  margin: 0 0 1.3rem;
`;

const Opciones = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const Opcion = styled.button`
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 2px solid ${(props) => (props.$acierto ? '#6fcf6f' : props.$fallo ? '#e05555' : 'rgba(255,255,255,0.2)')};
  background: ${(props) =>
    props.$acierto ? 'rgba(111,207,111,0.25)' :
    props.$fallo ? 'rgba(224,85,85,0.25)' :
    'rgba(255,255,255,0.12)'};
  color: #fdf6e3;
  font-size: 1.05rem;
  cursor: pointer;
  font-family: inherit;
  text-align: left;

  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.24); }
  &:disabled { cursor: default; }
`;

const Botones = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 1.2rem;
  flex-wrap: wrap;
`;

const Accion = styled.button`
  background: ${(props) => (props.$primario ? '#ffc857' : 'rgba(255,255,255,0.14)')};
  color: ${(props) => (props.$primario ? '#101a3a' : '#fdf6e3')};
  border: none;
  padding: 0.65rem 1.3rem;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
`;

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Baraja las preguntas para que no salga siempre la primera.
const barajarPreguntas = (lista) => revuelto(lista);

const JeopardyGame = ({ onBack }) => {
  const [puntos, setPuntos] = useState(0);
  const [usadas, setUsadas] = useState({});
  const [abierta, setAbierta] = useState(null);
  const [elegida, setElegida] = useState(null);

  // Las cinco categorías del tablero y sus cuatro preguntas de cada una.
  const tablero = useMemo(() => {
    const conPreguntas = TODAS.filter(
      (c) => c.id !== 'mixed' && Array.isArray(QUESTIONS[c.id]) && QUESTIONS[c.id].length >= 4
    );
    const categorias = revuelto(conPreguntas).slice(0, COLUMNAS);
    return categorias.map((c) => ({
      ...c,
      preguntas: barajarPreguntas(QUESTIONS[c.id]).slice(0, VALORES.length),
    }));
  }, []);

  const totalPosible = useMemo(
    () => tablero.reduce((suma, c) => suma + VALORES.reduce((s, v, i) => s + (c.preguntas[i] ? v : 0), 0), 0),
    [tablero]
  );

  const abrir = (categoria, indice) => {
    if (usadas[`${categoria.id}-${indice}`]) return;
    setAbierta({ categoria, indice });
    setElegida(null);
  };

  const pregunta = abierta ? abierta.categoria.preguntas[abierta.indice] : null;
  const valor = abierta ? VALORES[abierta.indice] : 0;

  const responder = (opcionIndice) => {
    if (!pregunta || elegida !== null) return;
    setElegida(opcionIndice);
    const correcto = opcionIndice === pregunta.correct;
    if (correcto) setPuntos((p) => p + valor);
    const clave = `${abierta.categoria.id}-${abierta.indice}`;
    setUsadas((u) => ({ ...u, [clave]: true }));
  };

  const cerrar = () => {
    setAbierta(null);
    setElegida(null);
  };

  const reiniciar = () => {
    setPuntos(0);
    setUsadas({});
    setAbierta(null);
    setElegida(null);
  };

  const todasUsadas = tablero.every((c) =>
    c.preguntas.every((_, i) => usadas[`${c.id}-${i}`])
  );

  return (
    <Page>
      <TopBar>
        <BackButton onClick={onBack} type="button">
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>🎬 Jeopardy</Title>
        <Puntos>🪙 {puntos} / {totalPosible}</Puntos>
      </TopBar>

      <Tablero>
        {tablero.map((c) => (
          <Cabecera key={c.id} $color={c.color}>
            {c.name}
          </Cabecera>
        ))}
        {VALORES.map((v, fila) =>
          tablero.map((c) => {
            const clave = `${c.id}-${fila}`;
            return (
              <Casilla
                key={clave}
                type="button"
                $usada={!!usadas[clave]}
                disabled={!!usadas[clave]}
                onClick={() => abrir(c, fila)}
              >
                {v}
              </Casilla>
            );
          })
        )}
      </Tablero>

      {todasUsadas && (
        <Botones>
          <Accion $primario type="button" onClick={reiniciar}>
            <FaRedo /> Otra partida
          </Accion>
        </Botones>
      )}

      {abierta && pregunta && (
        <Modal onClick={(e) => { if (e.target === e.currentTarget && elegida !== null) cerrar(); }}>
          <Panel role="dialog" aria-modal="true" aria-label="Pregunta">
            <Valor>{abierta.categoria.name} · {valor} puntos</Valor>
            <Pregunta>{pregunta.q}</Pregunta>
            <Opciones>
              {pregunta.a.map((opcion, i) => (
                <Opcion
                  key={i}
                  type="button"
                  $acierto={elegida !== null && i === pregunta.correct}
                  $fallo={elegida !== null && i === elegida && i !== pregunta.correct}
                  disabled={elegida !== null}
                  onClick={() => responder(i)}
                >
                  {opcion}
                </Opcion>
              ))}
            </Opciones>
            {elegida !== null && (
              <>
                <Botones>
                  <Accion $primario type="button" onClick={cerrar}>
                    <FaCheck /> Continuar
                  </Accion>
                </Botones>
                <Botones>
                  <Accion type="button" onClick={reiniciar}>
                    <FaTimes /> Reiniciar
                  </Accion>
                </Botones>
              </>
            )}
          </Panel>
        </Modal>
      )}
    </Page>
  );
};

export default JeopardyGame;
