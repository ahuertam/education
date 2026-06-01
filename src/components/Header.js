import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FaGraduationCap } from 'react-icons/fa';

const HeaderContainer = styled.header`
  text-align: center;
  padding: 3rem 2rem;
  color: white;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const LogoIcon = styled(FaGraduationCap)`
  font-size: 3rem;
  color: #ffd700;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(45deg, var(--brand-teal), var(--brand-orange));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const LogoImage = styled.img`
  height: clamp(120px, 14vw, 190px);
  width: auto;
  max-width: min(860px, 92vw);
  filter: drop-shadow(0 12px 22px rgba(0, 0, 0, 0.25));
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Header = () => {
  const [logoErrored, setLogoErrored] = useState(false);

  const logoSrc = useMemo(() => `${process.env.PUBLIC_URL}/logo22.png`, []);

  return (
    <HeaderContainer>
      <BrandRow>
        {!logoErrored ? (
          <LogoImage
            src={logoSrc}
            alt="Edutika"
            onError={() => setLogoErrored(true)}
          />
        ) : (
          <>
            <LogoIcon />
            <Title>Edutika</Title>
          </>
        )}
      </BrandRow>
      <Subtitle>
        ¡Aprende jugando! Descubre actividades educativas divertidas para desarrollar tus habilidades matemáticas y conocimientos generales.
      </Subtitle>
    </HeaderContainer>
  );
};

export default Header;
