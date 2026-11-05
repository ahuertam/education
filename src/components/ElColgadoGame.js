import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaLightbulb, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';
import { PALABRAS_AHORCADO, palabrasPorDificultad } from './data/ahorcadoPalabras';

const LETRAS = 'abcdefghijklmnopqrstuvwxyzñ'.split('');

// En español la tilde es opcional: si la palabra lleva "volcán", adivinar la
// "a" también vale. Sin esto, la mitad de las palabras serían imposibles de
// acertar con un teclado que no tiene tildes.
// La "ñ" se queda como está: en español es una letra distinta de la "n".
const sinTilde = (c) =>
  c === 'ñ' ? 'ñ' : c.normalize('NFD').replace(/[̀-ͯ]/g, '');

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 2rem;
  background: linear-gradient(180deg, #2b1b3d 0%, #1a1024 100%);
  color: #f3e9d2;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #f3e9d2;
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
  text-align: center;
`;

const Meta = styled.div`
  display: flex;
  gap: 0.8rem;
  font-weight: bold;
  font-size: 0.95rem;
  align-items: center;
`;

const Card = styled.section`
  max-width: 900px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 1.2rem;
  box-sizing: border-box;
`;

const Pista = styled.p`
  margin: 0 0 1rem;
  font-size: 1.15rem;
  line-height: 1.5;
  background: rgba(255, 220, 120, 0.12);
  border-left: 4px solid #ffc857;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
`;

const Palabra = styled.div`
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
`;

const Letra = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2.6rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  border-bottom: 3px solid ${(props) => (props.$acertada ? '#6fcf6f' : props.$fallada ? '#e05555' : 'rgba(255,255,255,0.35)')};
  color: ${(props) => (props.$fallada ? '#e05555' : '#f3e9d2')};
`;

const Teclado = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(2.4rem, 1fr));
  gap: 0.4rem;
`;

const Tecla = styled.button`
  aspect-ratio: 1;
  font-size: 1.05rem;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${(props) =>
    props.$estado === 'usada' ? 'rgba(255,255,255,0.07)' :
    props.$estado === 'fallo' ? 'rgba(224,85,85,0.35)' :
    props.$estado === 'acierto' ? 'rgba(111,207,111,0.35)' :
    'rgba(255,255,255,0.16)'};
  color: #f3e9d2;
  cursor: ${(props) => (props.$estado === 'usada' ? 'not-allowed' : 'pointer')};
  font-family: inherit;

  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.26); }
`;

const Botones = styled.div`
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 1.1rem;
  flex-wrap: wrap;
`;

const Accion = styled.button`
  background: ${(props) => (props.$primario ? '#ffc857' : 'rgba(255,255,255,0.14)')};
  color: ${(props) => (props.$primario ? '#2b1b3d' : '#f3e9d2')};
  border: none;
  padding: 0.6rem 1.2rem;
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
  text-align: center;
  max-width: 560px;
`;

const Opcion = styled.button`
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  color: #f3e9d2;
  font-size: 1.05rem;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: rgba(255, 255, 255, 0.22); }
`;

const Semaforo = styled.div`
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const Vida = styled.span`
  font-size: 1.5rem;
  filter: ${(props) => (props.$viva ? 'none' : 'grayscale(1) opacity(0.35)')};
`;

// El ahorcado se dibuja con SVG: la parte que sale depende de los fallos.
const Hangman = ({ errores }) => {
  const partes = [
    'M 60 190 L 60 40 L 130 40',       // poste y travesaño
    'M 130 40 L 130 70',                 // cuerda
    'M 130 70 m -12 0 a 12 12 a 12 12',  // cabeza
    'M 130 95 L 130 135',                // cuerpo
    'M 130 105 L 110 125',               // brazo
    'M 130 105 L 150 125',               // brazo
    'M 130 135 L 115 170',               // pierna
    'M 130 135 L 145 170',               // pierna
  ];
  return (
    <svg width="190" height="190" viewBox="0 0 190 190" role="img" aria-label={`Ahorcado con ${errores} errores`}>
      <line x1="20" y1="190" x2="170" y2="190" stroke="#8a7a5c" strokeWidth="3" />
      {partes.slice(0, errores).map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#e05555" strokeWidth="5" strokeLinecap="round" />
      ))}
    </svg>
  );
};

const REVUELTO = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ElColgadoGame = ({ onBack }) => {
  const [fase, setFase] = useState('menu');
  const [dificultad, setDificultad] = useState(2);
  const [cuantas, setCuantas] = useState(10);
  const [palabras, setPalabras] = useState([]);
  const [indice, setIndice] = useState(0);
  const [acertadas, setAcertadas] = useState([]);
  const [falladas, setFalladas] = useState([]);
  const [puntos, setPuntos] = useState(0);
  const [resumen, setResumen] = useState(null);

  const palabra = palabras[indice] || null;
  const errores = falladas.length;
  const intentos = 7;

  const azar = useCallback(() => {
    const pool = palabrasPorDificultad(dificultad);
    if (pool.length < cuantas) {
      // Si no hay palabras suficientes de esa dificultad, se completa con otras.
      const resto = PALABRAS_AHORCADO.filter((p) => !pool.includes(p));
      return REVUELTO([...pool, ...resto]).slice(0, cuantas);
    }
    return REVUELTO(pool).slice(0, cuantas);
  }, [dificultad, cuantas]);

  const empezar = () => {
    setPalabras(azar());
    setIndice(0);
    setAcertadas([]);
    setFalladas([]);
    setPuntos(0);
    setResumen(null);
    setFase('jugando');
  };

  const palabraCompleta = palabra
    ? palabra.palabra.split('').every((c) => c === '-' || acertadas.includes(sinTilde(c.toLowerCase())))
    : false;

  useEffect(() => {
    if (fase !== 'jugando' || !palabra) return;
    if (palabraCompleta) {
      const ganado = puntos + 100 + Math.max(0, (intentos - errores) * 25);
      setPuntos(ganado);
      if (indice + 1 >= palabras.length) {
        setResumen({ ganadas: palabras.length, puntos: ganado });
        setFase('fin');
      } else {
        setTimeout(() => {
          setIndice((i) => i + 1);
          setAcertadas([]);
          setFalladas([]);
        }, 900);
      }
    }
  }, [palabraCompleta, fase, palabra, indice, palabras.length, puntos, errores, intentos]);

  useEffect(() => {
    if (fase !== 'jugando' || !palabra) return;
    if (errores >= intentos) {
      setResumen({ ganadas: indice, puntos });
      setFase('fin');
    }
  }, [errores, fase, palabra, indice, puntos, intentos]);

  const letraEstado = (letra) => {
    if (acertadas.includes(letra)) return 'acierto';
    if (falladas.includes(letra)) return 'fallo';
    return 'usada';
  };

  const pulsar = (letra) => {
    if (fase !== 'jugando' || !palabra) return;
    if (acertadas.includes(letra) || falladas.includes(letra)) return;
    const enLaPalabra = palabra.palabra.toLowerCase().split('').some((c) => sinTilde(c) === letra);
    if (enLaPalabra) {
      setAcertadas((a) => [...a, letra]);
    } else {
      setFalladas((f) => [...f, letra]);
      setPuntos((p) => Math.max(0, p - 20));
    }
  };

  const pista = () => {
    if (fase !== 'jugando' || !palabra) return;
    const restantes = palabra.palabra.toLowerCase().split('').filter(
      (c) => c !== '-' && !acertadas.includes(sinTilde(c)) && !falladas.includes(sinTilde(c))
    );
    if (!restantes.length) return;
    setAcertadas((a) => [...a, sinTilde(restantes[0])]);
    setPuntos((p) => Math.max(0, p - 50));
  };

  const letrasVisibles = useMemo(
    () => (palabra ? palabra.palabra.split('') : []),
    [palabra]
  );

  return (
    <Page>
      <TopBar>
        <BackButton onClick={onBack} type="button">
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>🪢 El Colgado</Title>
        <Meta>
          <span>⭐ {puntos}</span>
          {fase === 'jugando' && palabra && (
            <span>Palabra {indice + 1}/{palabras.length}</span>
          )}
        </Meta>
      </TopBar>

      {fase === 'menu' && (
        <Menu>
          <h2>Adivina la palabra</h2>
          <p>Lee la pista y adivina letras. Con 7 fallos te cuelgan.</p>
          <h3>¿Qué tan difícil?</h3>
          {[1, 2, 3, 4].map((d) => (
            <Opcion key={d} type="button" onClick={() => setDificultad(d)}>
              {d === 1 ? 'Fácil' : d === 2 ? 'Normal' : d === 3 ? 'Difícil' : 'Experto'}
              {dificultad === d ? ' ✓' : ''}
            </Opcion>
          ))}
          <h3>¿Cuántas palabras?</h3>
          {[5, 10, 15].map((c) => (
            <Opcion key={c} type="button" onClick={() => setCuantas(c)}>
              {c} palabras {cuantas === c ? '✓' : ''}
            </Opcion>
          ))}
          <Botones>
            <Accion $primario type="button" onClick={empezar}>
              <FaCheck /> Jugar
            </Accion>
          </Botones>
        </Menu>
      )}

      {fase === 'jugando' && palabra && (
        <Card>
          <Semaforo>
            {Array.from({ length: intentos }).map((_, i) => (
              <Vida key={i} $viva={i < intentos - errores}>❤️</Vida>
            ))}
          </Semaforo>
          <Hangman errores={errores} />
          <Pista>💡 {palabra.pista}</Pista>
          <Palabra>
            {letrasVisibles.map((c, i) => {
              if (c === '-') return <Letra key={i}>-</Letra>;
              const l = sinTilde(c.toLowerCase());
              const ok = acertadas.includes(l);
              const mal = falladas.includes(l);
              return (
                <Letra key={i} $acertada={ok} $fallada={mal}>
                  {ok || mal ? c : ''}
                </Letra>
              );
            })}
          </Palabra>
          <Teclado>
            {LETRAS.map((l) => {
              const estado = letraEstado(l);
              return (
                <Tecla
                  key={l}
                  type="button"
                  $estado={estado}
                  disabled={estado === 'usada'}
                  onClick={() => pulsar(l)}
                  aria-label={`Letra ${l}`}
                >
                  {l}
                </Tecla>
              );
            })}
          </Teclado>
          <Botones>
            <Accion type="button" onClick={pista}>
              <FaLightbulb /> Pista (-50)
            </Accion>
            <Accion type="button" onClick={empezar}>
              <FaRedo /> Otra partida
            </Accion>
          </Botones>
        </Card>
      )}

      {fase === 'fin' && resumen && (
        <Menu>
          <h2>{resumen.ganadas === palabras.length ? '🎉 ¡Perfecto!' : resumen.ganadas > 0 ? '👍 Bien hecho' : '😕 Se acabó'}</h2>
          <p>
            Acertaste {resumen.ganadas} de {palabras.length} palabras.
          </p>
          <p>⭐ {resumen.puntos} puntos</p>
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

export default ElColgadoGame;
