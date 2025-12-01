import React from 'react';
import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import Header from './Header';
import { 
  FaPlus, 
  FaMinus, 
  FaTimes, 
  FaBrain, 
  FaBook, 
  FaPalette,
  FaDivide,
  FaCalculator
} from 'react-icons/fa';

const LandingContainer = styled.div`
  min-height: 100vh;
  padding-bottom: 3rem;
`;

const ActivitiesSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  color: white;
  margin-bottom: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 2rem;
  color: white;
  opacity: 0.8;
`;

const Landing = ({ onNavigate }) => {
  const activities = [
    {
      id: 1,
      icon: <FaPlus />,
      title: "Práctica de Sumas",
      description: "Aprende y practica operaciones de suma de manera divertida con ejercicios interactivos.",
      color: "#4CAF50"
    },
    {
      id: 2,
      icon: <FaMinus />,
      title: "Práctica de Restas",
      description: "Domina las restas con ejercicios progresivos y entretenidos juegos matemáticos.",
      color: "#FF5722"
    },
    {
      id: 3,
      icon: <FaTimes />,
      title: "Tablas de Multiplicar",
      description: "Memoriza las tablas de multiplicar jugando y practicando de forma interactiva.",
      color: "#9C27B0"
    },
    {
      id: 4,
      icon: <FaDivide />,
      title: "División Divertida",
      description: "Aprende división paso a paso con explicaciones claras y ejercicios prácticos.",
      color: "#FF9800"
    },
    {
      id: 5,
      icon: <FaBrain />,
      title: "Conocimientos Generales",
      description: "Expande tu cultura general con preguntas sobre ciencia, historia y geografía.",
      color: "#2196F3"
    },
    {
      id: 6,
      icon: <FaBook />,
      title: "Vocabulario",
      description: "Enriquece tu vocabulario aprendiendo nuevas palabras y sus significados.",
      color: "#795548"
    },
    {
      id: 7,
      icon: <FaPalette />,
      title: "Colores y Formas",
      description: "Reconoce colores, formas geométricas y desarrolla habilidades visuales.",
      color: "#E91E63"
    },
    {
      id: 8,
      icon: <FaCalculator />,
      title: "Matemáticas Mixtas",
      description: "Combina todas las operaciones matemáticas en desafíos emocionantes.",
      color: "#607D8B"
    }
  ];

  const handleActivityClick = (activity) => {
    alert(`¡Próximamente disponible: ${activity.title}!`);
  };

  return (
    <LandingContainer>
      <Header />
      <ActivitiesSection>
        <SectionTitle>🎯 Elige tu Actividad</SectionTitle>
        <CardsGrid>
          {activities.map(activity => (
            <ActivityCard
              key={activity.id}
              icon={activity.icon}
              title={activity.title}
              description={activity.description}
              color={activity.color}
              onClick={() => {
                const operations = {
                  1: 'addition',
                  2: 'subtraction',
                  3: 'multiplication',
                  4: 'division'
                };
                
                if (operations[activity.id]) {
                  onNavigate('multiplication-selector', operations[activity.id]);
                } else {
                  handleActivityClick(activity);
                }
              }}
            />
          ))}
        </CardsGrid>
      </ActivitiesSection>
      <Footer>
        <p>© 2024 EduJuegos - Aprendiendo mientras nos divertimos 🚀</p>
      </Footer>
    </LandingContainer>
  );
};

export default Landing;