import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(245, 250, 250, 0.92));
  border-radius: 20px;
  padding: 2rem;
  /* Una sombra corta y barata: las de 60-80 px de difuminado obligan al
     navegador a repintar una capa enorme en cada hover, y con quince
     tarjetas en pantalla el raton va con retardo. */
  box-shadow: 0 6px 18px rgba(11, 43, 69, 0.18);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);

  transition:
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 26px rgba(11, 43, 69, 0.24);
  }
`;

const IconContainer = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  text-align: center;
  color: ${props => props.color};
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${CardContainer}:hover & {
    transform: scale(1.08);
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
    color: var(--brand-teal);
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
