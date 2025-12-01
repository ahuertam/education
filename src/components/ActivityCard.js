import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Optimización de rendimiento */
  will-change: transform, box-shadow;
  transform: translateZ(0); /* Fuerza aceleración por hardware */
  backface-visibility: hidden;
  
  /* Transiciones separadas para mejor control */
  // Reducir aún más la duración
  transition: 
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  // O simplificar el hover
  &:hover {
    transform: translateY(-5px) translateZ(0);
    box-shadow: 
      25px 25px 80px rgba(190, 190, 190, 0.4),
      -25px -25px 80px rgba(255, 255, 255, 0.8);
  }


`;

const IconContainer = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  text-align: center;
  color: ${props => props.color};
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  
  ${CardContainer}:hover & {
    transform: scale(1.1) translateZ(0);
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 700;
  transition: color 0.2s ease;
  
  ${CardContainer}:hover & {
    color: #2196F3;
  }
`;

const Description = styled.p`
  color: #666;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
  transition: color 0.2s ease;
  
  ${CardContainer}:hover & {
    color: #555;
  }
`;

const ActivityCard = ({ icon, title, description, color, onClick }) => {
  return (
    <CardContainer onClick={onClick}>
      <IconContainer color={color}>
        {icon}
      </IconContainer>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </CardContainer>
  );
};

export default ActivityCard;