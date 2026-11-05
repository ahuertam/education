import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaTimes, FaRedo, FaClock } from 'react-icons/fa';
import { generateProblem, difficultyProfile, SMALL_PROFILE } from '../utils/problemGenerator';

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 2rem;
  background: linear-gradient(160deg, #1b2a4a 0%, #101a30 100%);
  color: #eef3ff;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #eef3ff;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;

  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
`;

const Meta = styled.div`
  display: flex;
  gap: 0.9rem;
  font-weight: bold;
  align-items: center;
  font-size: 0.95rem;
`;

const Card = styled.section`
  max-width: 800px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 1.4rem;
  box-sizing: border-box;
  text-align: center;
`;

const Pregunta = styled.div`
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0.6rem 0 1.2rem;
  letter-spacing: 1px;
`;

const Opciones = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
`;

const Opcion = styled.button`
  padding: 1.1rem 0.8rem;
  border-radius: 14px;
  border: 2px solid ${(props) => (props.$acierto ? '#6fcf6f' : props.$fallo ? '#e05555' : 'rgba(255,255,255,0.2)')};
  background: ${(props) =>
    props.$acierto ? 'rgba(111,207,111,0.25)' :
    props.$fallo ? 'rgba(224,85,85,0.25)' :
    'rgba(255,255,255,0.12)'};
  color: #eef3ff;
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;

  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.24); }
  &:disabled { cursor: default; }
`;

const Apuestas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.8rem;
  margin: 1.2rem 0;
`;

const Apuesta = styled.button`
  padding: 1.1rem 0.8rem;
  border-radius: 14px;
  border: 2px solid ${(props) => (props.$elegida ? '#ffc857' : 'rgba(255,255,255,0.2)')};
  background: ${(props) => (props.$elegida ? 'rgba(255,200,87,0.22)' : 'rgba(255,255,255,0.12)')};
  color: #eef3ff;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;

  strong { display: block; font-size: 1.6rem; margin-top: 0.3rem; }
  &:hover { background: rgba(255, 255, 255, 0.24); }
`;

const Barra = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
  margin: 0.8rem 0 1.2rem;
`;

const Relleno = styled.div`
  height: 100%;
  width: ${(props) => `${props.$pct}%`};
  background: ${(props) => (props.$pct > 50 ? '#6fcf6f' : props.$pct > 20 ? '#ffc857' : '#e05555')};
  transition: width 0.2s linear;
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
  color: ${(props) => (props.$primario ? '#1b2a4a' : '#eef3ff')};
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

const Menu = styled(Card)`
  max-width: 560px;
`;

const OpcionMenu = styled.button`
  display: block;
  width: 100%;
  margin: 0.45rem 0;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${(props) => (props.$activo ? 'rgba(255,200,87,0.25)' : 'rgba(255,255,255,0.12)')};
  color: #eef3ff;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: rgba(255, 255, 255, 0.22); }
`;

const Aviso = styled.p`
  font-size: 1.15rem;
  line-height: 1.5;
  margin: 0.4rem 0;
`;

const multiplicadores = [1, 2, 3];
const SEGUNDOS = 20;

const BetYourAnswerGame = ({ onBack, operation = 'multiplication', multiplicationConfig = null }) => {
  const [fase, setFase] = useState('menu');
  const [operaciones, setOperaciones] = useState(['multiplication']);
  const [puntos, setPuntos] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [problema, setProblema] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [apuesta, setApuesta] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [tiempo, setTiempo] = useState(SEGUNDOS);
  const [aciertos, setAciertos] = useState(0);

  const cronometroRef = useRef(null);

  // Genera la cuenta y tres distractores cercanos al resultado.
  const nuevaPregunta = useCallback(() => {
    const op = operaciones[Math.floor(Math.random() * operaciones.length)];
    const perfil = op === 'multiplication'
      ? difficultyProfile('medium')
      : SMALL_PROFILE;
    const p = generateProblem({
      operation: op,
      profile: perfil,
      multiplicationConfig: op === 'multiplication' ? multiplicationConfig : null,
    });
    const respuesta = p.answer;
    const otras = new Set();
    let intentos = 0;
    while (otras.size < 3 && intentos < 60) {
      intentos++;
      const salto = (Math.floor(Math.random() * 9) + 1) * (Math.random() < 0.5 ? -1 : 1);
      const cand = respuesta + salto;
      if (cand !== respuesta && cand >= 0) otras.add(cand);
    }
    // Si no se llenaron (respuesta muy pequeña), se añaden por encima.
    let extra = 1;
    while (otras.size < 3) {
      const cand = respuesta + extra;
      if (cand !== respuesta) otras.add(cand);
      extra++;
    }
    setProblema({ ...p, operacion: op, text: `${p.a} ${p.operator} ${p.b} = ?` });
    setOpciones([respuesta, ...otras].sort(() => Math.random() - 0.5));
    setApuesta(null);
    setResultado(null);
    setTiempo(SEGUNDOS);
  }, [operaciones, multiplicationConfig]);

  const empezar = () => {
    setPuntos(0);
    setRonda(0);
    setAciertos(0);
    nuevaPregunta();
    setFase('jugando');
  };

  // El reloj de la ronda.
  useEffect(() => {
    if (fase !== 'jugando' || resultado || apuesta === null) return undefined;
    const id = setInterval(() => {
      setTiempo((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    cronometroRef.current = id;
    return () => clearInterval(id);
  }, [fase, resultado, apuesta, problema]);

  // Si se acaba el tiempo, cuenta como fallo.
  useEffect(() => {
    if (fase !== 'jugando' || resultado || apuesta === null) return;
    if (tiempo > 0) return;
    setResultado({ correcto: false, sinTiempo: true, elegida: null });
    setPuntos((p) => Math.max(0, p - 50 * apuesta));
    setRonda((r) => r + 1);
  }, [tiempo, fase, resultado, apuesta]);

  const elegirApuesta = (mult) => {
    setApuesta(mult);
  };

  const responder = (valor) => {
    if (fase !== 'jugando' || resultado || apuesta === null) return;
    const correcto = valor === problema.answer;
    setResultado({ correcto, elegida: valor });
    if (correcto) {
      const ganado = 50 * apuesta;
      setPuntos((p) => p + ganado);
      setAciertos((a) => a + 1);
    } else {
      setPuntos((p) => Math.max(0, p - 50 * apuesta));
    }
    setRonda((r) => r + 1);
  };

  const siguiente = () => {
    nuevaPregunta();
  };

  const fin = ronda >= 10;

  return (
    <Page>
      <TopBar>
        <BackButton onClick={onBack} type="button">
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>🎲 Apuesta tu respuesta</Title>
        <Meta>
          <span>🪙 {puntos}</span>
          <span>Ronda {Math.min(ronda + 1, 10)}/10</span>
        </Meta>
      </TopBar>

      {fase === 'menu' && (
        <Menu>
          <h2>Apuesta antes de responder</h2>
          <Aviso>
            Elige cuánto arriesgas: si aciertas, ganas el doble o el triple; si
            fallas, pierdes lo mismo. Diez rondas.
          </Aviso>
          <h3>¿Qué operaciones?</h3>
          {[
            ['addition', '➕ Suma'],
            ['subtraction', '➖ Resta'],
            ['multiplication', '✖️ Multiplicación'],
            ['division', '➗ División'],
          ].map(([id, texto]) => (
            <OpcionMenu
              key={id}
              type="button"
              $activo={operaciones.includes(id)}
              onClick={() =>
                setOperaciones((o) =>
                  o.includes(id) ? (o.length === 1 ? o : o.filter((x) => x !== id)) : [...o, id]
                )
              }
            >
              {texto} {operaciones.includes(id) ? '✓' : ''}
            </OpcionMenu>
          ))}
          <Botones>
            <Accion $primario type="button" onClick={empezar}>
              <FaCheck /> Jugar
            </Accion>
          </Botones>
        </Menu>
      )}

      {fase === 'jugando' && problema && !fin && (
        <Card>
          {apuesta === null ? (
            <>
              <h2>¿Cuánto apuestas?</h2>
              <Pregunta>{problema.text}</Pregunta>
              <Apuestas>
                {multiplicadores.map((m) => (
                  <Apuesta
                    key={m}
                    type="button"
                    $elegida={apuesta === m}
                    onClick={() => elegirApuesta(m)}
                  >
                    {m === 1 ? 'Tranquila' : m === 2 ? 'Segura' : 'Valiente'}
                    <strong>x{m}</strong>
                    {m === 1 ? '50 puntos' : m === 2 ? '100 puntos' : '150 puntos'}
                  </Apuesta>
                ))}
              </Apuestas>
              <Aviso>Si aciertas, ganas esa cantidad. Si fallas, la pierdes.</Aviso>
            </>
          ) : (
            <>
              <h2>Elige la respuesta</h2>
              <Pregunta>{problema.text}</Pregunta>
              {tiempo > 0 && !resultado && (
                <>
                  <Barra>
                    <Relleno $pct={(tiempo / SEGUNDOS) * 100} />
                  </Barra>
                  <Aviso>
                    <FaClock /> {tiempo} s · Apuesta x{apuesta}
                  </Aviso>
                </>
              )}
              <Opciones>
                {opciones.map((o) => (
                  <Opcion
                    key={o}
                    type="button"
                    $acierto={resultado && o === problema.answer}
                    $fallo={resultado && o === resultado.elegida && !resultado.correcto}
                    disabled={!!resultado}
                    onClick={() => responder(o)}
                  >
                    {o}
                  </Opcion>
                ))}
              </Opciones>
              {resultado && (
                <>
                  <Aviso>
                    {resultado.sinTiempo
                      ? '⏰ ¡Se acabó el tiempo! Perdiste la apuesta.'
                      : resultado.correcto
                        ? `✅ ¡Correcto! Ganaste ${50 * apuesta} puntos.`
                        : `❌ La respuesta era ${problema.answer}. Perdiste ${50 * apuesta} puntos.`}
                  </Aviso>
                  <Botones>
                    <Accion $primario type="button" onClick={siguiente}>
                      Siguiente
                    </Accion>
                  </Botones>
                </>
              )}
            </>
          )}
        </Card>
      )}

      {fase === 'jugando' && fin && (
        <Menu>
          <h2>{aciertos >= 7 ? '🏆 ¡Crack del gambling!' : aciertos >= 4 ? '👍 Bien jugado' : '🍀 Mejor la próxima'}</h2>
          <Aviso>
            Acertaste {aciertos} de 10. Puntos finales: {puntos}.
          </Aviso>
          <Botones>
            <Accion $primario type="button" onClick={empezar}>
              <FaRedo /> Otra partida
            </Accion>
            <Accion type="button" onClick={onBack}>
              <FaTimes /> Salir
            </Accion>
          </Botones>
        </Menu>
      )}

    </Page>
  );
};

export default BetYourAnswerGame;
