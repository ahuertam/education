import React from 'react';
import styled from 'styled-components';
import ActivityCard from './ActivityCard';
import Header from './Header';
import { CATEGORIES, CATEGORY_NEEDS_CONFIG } from '../config/games';

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
  background: linear-gradient(45deg, var(--brand-teal), var(--brand-orange));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

const FooterLogo = styled.img`
  height: 22px;
  width: auto;
  vertical-align: -4px;
  margin-left: 0.4rem;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));
`;

const ManifestoDetails = styled.details`
  margin: 1rem auto 0;
  max-width: 760px;
  text-align: left;
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.9;

  summary {
    cursor: pointer;
    list-style: none;
    outline: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }
`;

const ManifestoSummary = styled.summary`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
`;

const ManifestoContent = styled.div`
  margin-top: 0.75rem;
  opacity: 0.95;

  p {
    margin: 0.5rem 0;
  }

  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const Landing = ({ onNavigate }) => {
  const donationUrl = process.env.REACT_APP_DONATION_URL;

  const activities = CATEGORIES;

  const handleActivityClick = (activity) => {
    alert(`¡Próximamente disponible: ${activity.title}!`);
  };

  const onSelectActivity = (activityId) => {
    const activity = activities.find(act => act.id === activityId);

    // Un juego que se abre directamente, sin pasar por el selector.
    if (activity?.view) {
      onNavigate(activity.view);
      return;
    }

    if (activity?.category) {
      // La multiplicación pasa antes por la pantalla de selección de
      // tablas y cifras.
      if (activity.category === CATEGORY_NEEDS_CONFIG) {
        onNavigate('multiplication-config', activity.category);
      } else {
        onNavigate('game-selector', activity.category);
      }
      return;
    }

    handleActivityClick(activity || { title: "esta actividad" });
  };


  return (
    <LandingContainer>
      <Header />
      <ActivitiesSection>
        <SectionTitle>🎯 Elige tu Actividad</SectionTitle>
        {/* Original CardsGrid for basic math and general knowledge */}
        <CardsGrid>
          {activities.slice(0, 6).map(activity => ( // Display first 6 activities in the original grid
            <ActivityCard
              key={activity.id}
              icon={<activity.icon />}
              title={activity.title}
              description={activity.description}
              color={activity.color}
              onClick={() => onSelectActivity(activity.id)}
            />
          ))}
        </CardsGrid>
      </ActivitiesSection>

      <ActivitiesSection>
        <CardsGrid>
          {activities.slice(6).map(activity => (
            <ActivityCard
              key={activity.id}
              icon={<activity.icon />}
              title={activity.title}
              description={activity.description}
              color={activity.color}
              onClick={() => onSelectActivity(activity.id)}
            />
          ))}
        </CardsGrid>
      </ActivitiesSection>
      <Footer>
        <p>
          © 2024 Edutika - Aprendiendo mientras nos divertimos
          <FooterLogo src={`${process.env.PUBLIC_URL}/edutikalogo.png`} alt="Edutika" />
        </p>
        <ManifestoDetails>
          <ManifestoSummary>Sobre el proyecto</ManifestoSummary>
          <ManifestoContent>
            <p>
              Edutika es un proyecto educativo sin publicidad y gratuito para cualquiera.
            </p>
            <p>
              Si te resulta útil y quieres ayudar con el mantenimiento (por ejemplo, dominio/servidor),
              {donationUrl ? (
                <>
                  puedes aportar una donación de forma discreta{' '}
                  <a href={donationUrl} target="_blank" rel="noreferrer">
                    aquí
                  </a>
                  .
                </>
              ) : (
                <>puedes aportar una donación de forma discreta.</>
              )}
            </p>
          </ManifestoContent>
        </ManifestoDetails>
      </Footer>
    </LandingContainer>
  );
};

export default Landing;
