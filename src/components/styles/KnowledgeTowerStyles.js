import styled, { keyframes } from 'styled-components';

export const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
`;

export const Header = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  z-index: 10;
  pointer-events: none;
`;

export const Button = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #4A90E2;
  color: #4A90E2;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  pointer-events: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  &:hover {
    background: #4A90E2;
    color: white;
    transform: scale(1.05);
  }
`;

export const Score = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(74, 144, 226, 0.9);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: 3px solid white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
`;

export const CanvasContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

export const QuestionPanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  border: 4px solid #4A90E2;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  max-width: 600px;
  width: 90%;
  text-align: center;
  z-index: 5;
`;

export const QuestionText = styled.h2`
  font-size: 1.5rem;
  color: #2C3E50;
  margin: 0;
`;

export const AnswerBlocksContainer = styled.div`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 6;
`;

export const AnswerBlock = styled.div`
  background: ${props => props.color || '#4ECDC4'};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
  transition: all 0.2s;
  min-width: 150px;
  text-align: center;
  border: 3px solid rgba(255,255,255,0.5);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const FeedbackPanel = styled.div`
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%) scale(${props => props.$show ? 1 : 0});
  background: ${props => props.$isCorrect ? '#2ECC71' : '#E74C3C'};
  color: white;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 15;
  transition: transform 0.3s ease;
  min-width: 300px;
  text-align: center;
`;

export const MenuOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 3rem;
  border-radius: 30px;
  text-align: center;
  z-index: 25;
  box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  border: 5px solid #4A90E2;
  max-width: 800px;
  width: 90%;
`;

export const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

export const CategoryCard = styled.button`
  background: ${props => props.color};
  color: white;
  padding: 1.5rem;
  border: none;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  }
`;

export const GameOverOverlay = styled(MenuOverlay)`
  border-color: ${props => props.$won ? '#2ECC71' : '#E74C3C'};
`;
