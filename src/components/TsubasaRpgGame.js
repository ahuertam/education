import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const Container = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at 30% 20%, #0b1b2d 0%, #040813 55%, #02040a 100%);
  color: #fff;
  padding: 16px;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 1100px;
  margin: 0 auto 14px;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(6px);
`;

const Title = styled.div`
  font-weight: 900;
  letter-spacing: 0.5px;
  text-align: center;
  flex: 1;
`;

const GameContainer = styled.div`
  position: relative;
  width: min(760px, 100%, calc((100vh - 220px) * 256 / 240));
  aspect-ratio: 256 / 240;
  margin: 20px auto;
  background: #000;
  border: 15px solid #333;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  &::after {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    background-size: 100% 4px, 3px 100%;
    pointer-events: none;
    z-index: 10;
  }

  &::before {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: radial-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 100%), rgba(0, 0, 0, 0);
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    z-index: 11;
  }
`;

const GameIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
`;

const TsubasaRpgGame = ({ onBack }) => {
  const src = `${process.env.PUBLIC_URL}/games/tsubasa/index.html`;

  return (
    <Container>
      <Header>
        <Button onClick={onBack}>
          <FaArrowLeft /> Volver
        </Button>
        <Title>RPG Fútbol por turnos</Title>
        <div style={{ width: 90 }} />
      </Header>

      <GameContainer>
        <GameIframe title="RPG Fútbol por turnos" src={src} />
      </GameContainer>
    </Container>
  );
};

export default TsubasaRpgGame;
