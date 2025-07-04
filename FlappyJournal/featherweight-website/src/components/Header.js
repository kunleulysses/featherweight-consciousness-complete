import React, { useState } from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1.5rem 0;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  
  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.75rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  color: #1a1a1a;
  
  img {
    height: 48px;
    margin-right: 16px;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  gap: 3rem;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 3rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    gap: 2rem;
  }
`;

const NavLink = styled.li`
  a {
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    cursor: pointer;
    font-size: 1rem;
    letter-spacing: 0.02em;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -8px;
      left: 50%;
      background: linear-gradient(135deg, #8b5a3c, #c4a484);
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      transform: translateX(-50%);
    }
    
    &:hover {
      color: #8b5a3c;
      
      &:after {
        width: 100%;
      }
    }
  }
`;

const MobileToggle = styled.button`
  display: none;
  background: none;
  font-size: 1.5rem;
  color: #1a1a1a;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleLogoClick = () => {
    scrollToSection('home');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo onClick={handleLogoClick}>
          <img src="/8.png" alt="Featherweight" />
          Featherweight
        </Logo>
        
        <NavLinks isOpen={isOpen}>
          <NavLink><a onClick={() => scrollToSection('home')}>Home</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('architecture')}>Architecture</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('applications')}>Applications</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('research')}>Research</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('ethics')}>Ethics</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('about')}>About</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('access')}>Access</a></NavLink>
          <NavLink><a onClick={() => scrollToSection('contact')}>Contact</a></NavLink>
        </NavLinks>
        
        <MobileToggle onClick={() => setIsOpen(!isOpen)}>
          ≡
        </MobileToggle>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
