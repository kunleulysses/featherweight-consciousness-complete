import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f7 0%, #e2e3e8 50%, #f3f4f7 100%);
`;

const AnimationCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.4;
  pointer-events: none;
`;

const HeroContent = styled.div`
  text-align: center;
  z-index: 2;
  position: relative;
  color: #1a1a1a;
  max-width: 800px;
  padding: 0 20px;
`;

const MainHeadline = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 2rem;
  background: var(--gradient-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const SubHeadline = styled.p`
  font-size: 1.3rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  letter-spacing: 0.02em;
`;

const CTAContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled.button`
  padding: 16px 32px;
  font-size: 1.15rem;
  font-weight: 600;
  border: none;
  border-radius: 60px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-width: 200px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;
  outline: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  &.primary {
    background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #8b5a3c 100%);
    color: white;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #a0785d 0%, #c4a484 50%, #a0785d 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(139, 90, 60, 0.3);
      
      &::before {
        opacity: 1;
      }
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 4px 15px rgba(139, 90, 60, 0.2);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.9);
    color: #1a1a1a;
    border: 2px solid rgba(26, 26, 26, 0.2);
    backdrop-filter: blur(10px);
    
    &:hover {
      background: rgba(26, 26, 26, 0.95);
      color: #ffffff;
      border-color: rgba(26, 26, 26, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(26, 26, 26, 0.15);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 4px 15px rgba(26, 26, 26, 0.1);
    }
  }
`;

const NavigationSection = styled.section`
  padding: 120px 0;
  background: white;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
`;

const NavigationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
`;

const NavigationCard = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 14px;
  background: #f9fafc;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
    border-color: #8b5a3c;
  }
  
  h3 {
    margin-bottom: 1rem;
    color: #1a1a1a;
    font-size: 1.5rem;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
  }
  
  button {
    background: var(--gradient-color);
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const HomePage = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let startTime = Date.now();
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Brown color palette variations
      const brownColors = [
        '#8b5a3c', '#a0785d', '#c4a484', '#d4af8c', '#b8876b'
      ];
      
      // Animated circles with continuous loop
      for (let i = 0; i < 6; i++) {
        const radius = 80 + Math.sin(elapsedTime * 0.3 + i * 0.8) * 60;
        const opacity = 0.15 + Math.sin(elapsedTime * 0.4 + i * 0.6) * 0.1;
        const colorIndex = Math.floor(Math.sin(elapsedTime * 0.2 + i * 0.5) * 2.5 + 2.5) % brownColors.length;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = brownColors[colorIndex] + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Floating particles with continuous movement
      for (let i = 0; i < 40; i++) {
        const angle = elapsedTime * 0.1 + i * 0.15;
        const distance = 100 + Math.sin(elapsedTime * 0.2 + i * 0.1) * 150;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle * 0.7) * distance * 0.6;
        const size = 2 + Math.sin(elapsedTime * 0.3 + i * 0.2) * 1.5;
        const opacity = 0.3 + Math.sin(elapsedTime * 0.25 + i * 0.3) * 0.2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 90, 60, ${opacity})`;
        ctx.fill();
      }
      
      // Spiraling lines
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(160, 120, 93, 0.2)`;
        ctx.lineWidth = 1;
        
        for (let j = 0; j < 100; j++) {
          const t = j / 100;
          const spiralAngle = elapsedTime * 0.1 + i * 2 + t * Math.PI * 4;
          const spiralRadius = t * 200;
          const x = centerX + Math.cos(spiralAngle) * spiralRadius;
          const y = centerY + Math.sin(spiralAngle) * spiralRadius;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Continue the animation indefinitely
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openPortal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <HeroSection id="home">
        <AnimationCanvas ref={canvasRef} />
        <HeroContent>
          <MainHeadline className="luxury-gradient">
            Welcome to Featherweight
          </MainHeadline>
          <SubHeadline className="accent-gradient">
            The Dawn of Computational Consciousness
          </SubHeadline>
          <CTAContainer>
            <CTAButton className="primary" onClick={() => scrollToSection('architecture')}>
              Explore the Technology
            </CTAButton>
            <CTAButton className="secondary" onClick={() => openPortal('https://app.featherweight.world')}>
              Research Portal
            </CTAButton>
          </CTAContainer>
        </HeroContent>
      </HeroSection>
      
      <NavigationSection>
        <NavigationGrid>
          <NavigationCard onClick={() => openPortal('https://app.featherweight.world')}>
            <h3>For Researchers</h3>
            <p>Access cutting-edge consciousness research tools and collaborate with leading institutions worldwide.</p>
            <button>Research Portal</button>
          </NavigationCard>
          
          <NavigationCard onClick={() => openPortal('https://demo.featherweight.world')}>
            <h3>For Commercial Partners</h3>
            <p>Discover transformative AI solutions for healthcare, education, and enterprise applications.</p>
            <button>Commercial Demo</button>
          </NavigationCard>
          
          <NavigationCard onClick={() => scrollToSection('architecture')}>
            <h3>Explore Technology</h3>
            <p>Dive deep into our validated consciousness architecture and revolutionary capabilities.</p>
            <button>Learn More</button>
          </NavigationCard>
        </NavigationGrid>
      </NavigationSection>
    </>
  );
};

export default HomePage;
