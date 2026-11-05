import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaCheck, FaTimes, FaRedo, FaClock, FaLightbulb } from 'react-icons/fa';
import { PALABRAS_AHORCADO, palabrasPorDificultad } from './data/ahorcadoPalabras';

const SEGUNDOS_POR_PALABRA = 30;

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem 1rem 2rem;
  background: linear-gradient(160deg, #2d1b4e 0%, #170d2b 100%);
  color: #fdf4e3;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
`;

const TopBar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 860px;
  margin: 0 auto 1rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fdf4e3;
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
  max-width: 860px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 1.3rem;
  box-sizing: border-box;
`;

const Pista = styled.p`
  margin: 0 0 1.1rem;
  font-size: 1.1rem;
  line-height: 1.5;
  background: rgba(255, 200, 87, 0.13);
  border-left: 4px solid #ffc857;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
`;

const Palabra = styled.div`
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.3rem;
`;

const Hueco = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.7rem;
  font-size: 1.6rem;
  font-weight: bold;
  text-transform: lowercase;
  border-bottom: 3px solid ${(props) => (props.$puesta ? '#6fcf6f' : 'rgba(255,255,255,0.4)')};
  color: ${(props) => (props.$puesta ? '#6fcf6f' : 'transparent')};
  transition: color 0.15s;
`;

const Letras = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(2.6rem, 1fr));
  gap: 0.45rem;
`;

const Letra = styled.button`
  aspect-ratio: 1;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: ${(props) => (props.$usada ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.16)')};
  color: #fdf4e3;
  cursor: ${(props) => (props.$usada ? 'default' : 'pointer')};
  font-family: inherit;
  text-transform: lowercase;

  &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.28); }
`;

const Barra = styled.div`
  height: 9px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const Relleno = styled.div`
  height: 100%;
  width: ${(props) => `${props.$pct}%`};
  background: ${(props) => (props.$pct > 50 ? '#6fcf6f' : props.$pct > 20 ? '#ffc857' : '#e05555')};
  transition: width 0.3s linear;
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
  color: ${(props) => (props.$primario ? '#2d1b4e' : '#fdf4e3')};
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
  text-align: center;
  max-width: 560px;
`;

const Opcion = styled.button`
  display: block;
  width: 100%;
  margin: 0.45rem 0;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${(props) => (props.$activo ? 'rgba(255,200,87,0.25)' : 'rgba(255,255,255,0.12)')};
  color: #fdf4e3;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: rgba(255, 255, 255, 0.22); }
`;

const Aviso = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0.5rem 0;
`;

const revuelto = (lista) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Igual que en El Colgado: la tilde es opcional y la ñ es su propia letra.
const sinTilde = (c) =>
  c === 'ñ' ? 'ñ' : c.normalize('NFD').replace(/[̀-ͯ]/g, '');

const RoscoPalabrasGame = ({ onBack }) => {
  const [fase, setFase] = useState('menu');
  const [dificultad, setDificultad] = useState(1);
  const [cuantas, setCuantas] = useState(10);
  const [palabras, setPalabras] = useState([]);
  const [indice, setIndice] = useState(0);
  const [puestas, setPuestas] = useState('');
  const [falladas, setFalladas] = useState(new Set());
  const [letras, setLetras] = useState([]);
  const [tiempo, setTiempo] = useState(SEGUNDOS_POR_PALABRA);
  const [puntos, setPuntos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [resumen, setResumen] = useState(null);

  const palabra = palabras[indice] || null;
  const cronometroRef = useRef(null);
  const avanzarRef = useRef(null);

  // El salto a la palabra siguiente no debe quedar vivo al desmontar.
  useEffect(() => () => clearTimeout(avanzarRef.current), []);

  const preparar = useCallback((nivel, cuantasPalabras) => {
    const pool = palabrasPorDificultad(nivel);
    const base = pool.length >= cuantasPalabras
      ? pool
      : [...pool, ...PALABRAS_AHORCADO.filter((p) => !pool.includes(p))];
    const elegidas = revuelto(base).slice(0, cuantasPalabras);
    setPalabras(elegidas);
    setIndice(0);
    setPuntos(0);
    setAciertos(0);
    setResumen(null);
    return elegidas;
  }, []);

  const cargarLetras = useCallback((texto) => {
    const unicas = [...new Set(texto.toLowerCase().split('').filter((c) => c !== '-'))];
    setLetras(revuelto(unicas));
    setFalladas(new Set());
    setPuestas('');
    setTiempo(SEGUNDOS_POR_PALABRA);
  }, []);

  const empezar = () => {
    const elegidas = preparar(dificultad, cuantas);
    cargarLetras(elegidas[0].palabra);
    setFase('jugando');
  };

  // El reloj de la palabra.
  useEffect(() => {
    if (fase !== 'jugando' || !palabra) return undefined;
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
  }, [fase, palabra, indice]);

  // Se acabó el tiempo: cuenta como fallada.
  useEffect(() => {
    if (fase !== 'jugando' || !palabra || tiempo > 0) return;
    const siguiente = indice + 1;
    if (siguiente >= palabras.length) {
      setResumen({ puntos, acertados: aciertos });
      setFase('fin');
      return;
    }
    setIndice(siguiente);
    cargarLetras(palabras[siguiente].palabra);
  }, [tiempo, fase, palabra, indice, palabras, puntos, aciertos, cargarLetras]);

  // La letra que toca ahora. Una palabra puede repetir letra ("cascada"), así que
  // una letra ya puesta sigue disponible si es la que toca.
  const esperada = palabra ? sinTilde(palabra.palabra.toLowerCase()[puestas.length] || '') : '';

  const pulsar = (letra) => {
    if (fase !== 'jugando' || !palabra) return;
    const objetivo = palabra.palabra.toLowerCase();
    if (sinTilde(letra) !== esperada) {
      // Letra que no toca: se descarta, pero no penaliza los puntos.
      if (!falladas.has(letra)) setFalladas((f) => new Set([...f, letra]));
      return;
    }
    const nuevasPuestas = puestas + letra;
    setPuestas(nuevasPuestas);
    if (nuevasPuestas.length === objetivo.length) {
      const bonus = Math.max(0, tiempo) * 4;
      setPuntos((p) => p + 100 + bonus);
      setAciertos((a) => a + 1);
      const siguiente = indice + 1;
      clearTimeout(avanzarRef.current);
      avanzarRef.current = setTimeout(() => {
        if (siguiente >= palabras.length) {
          setResumen({ puntos: puntos + 100 + bonus, acertados: aciertos + 1 });
          setFase('fin');
        } else {
          setIndice(siguiente);
          cargarLetras(palabras[siguiente].palabra);
        }
      }, 500);
    }
  };

  const pista = () => {
    if (fase !== 'jugando' || !palabra) return;
    const objetivo = palabra.palabra.toLowerCase();
    const siguiente = objetivo[puestas.length];
    if (!siguiente) return;
    setPuestas(puestas + sinTilde(siguiente));
    setPuntos((p) => Math.max(0, p - 30));
  };

  return (
    <Page>
      <TopBar>
        <BackButton onClick={onBack} type="button">
          <FaArrowLeft /> Volver
        </BackButton>
        <Title>🔤 Rosco de Palabras</Title>
        <Meta>
          <span>⭐ {puntos}</span>
          {fase === 'jugando' && palabra && <span>{indice + 1}/{palabras.length}</span>}
        </Meta>
      </TopBar>

      {fase === 'menu' && (
        <Menu>
          <h2>Escribe la palabra, letra a letra</h2>
          <Aviso>
            Lee la pista y toca las letras en orden. Cada palabra tiene su
            tiempo: cuanto más rápido la escribas, más puntos.
          </Aviso>
          <h3>¿Qué tan difícil?</h3>
          {[1, 2, 3, 4].map((d) => (
            <Opcion key={d} type="button" $activo={dificultad === d} onClick={() => setDificultad(d)}>
              {d === 1 ? 'Fácil' : d === 2 ? 'Normal' : d === 3 ? 'Difícil' : 'Experto'}
              {dificultad === d ? ' ✓' : ''}
            </Opcion>
          ))}
          <h3>¿Cuántas palabras?</h3>
          {[5, 10, 15].map((c) => (
            <Opcion key={c} type="button" $activo={cuantas === c} onClick={() => setCuantas(c)}>
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
          <Barra>
            <Relleno $pct={(tiempo / SEGUNDOS_POR_PALABRA) * 100} />
          </Barra>
          <Aviso>
            <FaClock /> {tiempo} s
          </Aviso>
          <Pista>💡 {palabra.pista}</Pista>
          <Palabra>
            {palabra.palabra.split('').map((c, i) => (
              <Hueco key={i} $puesta={!!puestas[i]}>
                {puestas[i] || ''}
              </Hueco>
            ))}
          </Palabra>
          <Letras>
            {letras.map((l) => {
              // Solo se bloquean las letras que se fallaron. Una letra ya
              // puesta sigue disponible porque la palabra puede repetirla.
              const bloqueada = falladas.has(l);
              return (
                <Letra
                  key={l}
                  type="button"
                  $usada={bloqueada}
                  disabled={bloqueada}
                  onClick={() => pulsar(l)}
                  aria-label={`Letra ${l}`}
                >
                  {l}
                </Letra>
              );
            })}
          </Letras>
          <Botones>
            <Accion type="button" onClick={pista}>
              <FaLightbulb /> Pista (-30)
            </Accion>
            <Accion type="button" onClick={empezar}>
              <FaRedo /> Reiniciar
            </Accion>
          </Botones>
        </Card>
      )}

      {fase === 'fin' && resumen && (
        <Menu>
          <h2>{resumen.acertados >= Math.ceil(palabras.length * 0.7) ? '🎉 ¡Muy rápido!' : '👍 Bien'}</h2>
          <Aviso>
            Acertaste {resumen.acertados} de {palabras.length}. Puntos: {resumen.puntos}.
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

export default RoscoPalabrasGame;
