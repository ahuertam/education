import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(245, 250, 250, 0.92));
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    20px 20px 60px rgba(11, 43, 69, 0.25),
    -20px -20px 60px rgba(255, 255, 255, 0.35);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  
  will-change: transform, box-shadow;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  transition: 
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-5px) translateZ(0);
    box-shadow: 
      25px 25px 80px rgba(11, 43, 69, 0.28),
      -25px -25px 80px rgba(255, 255, 255, 0.5);
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
