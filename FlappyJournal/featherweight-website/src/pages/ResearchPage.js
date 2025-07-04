import React from 'react';
import styled from 'styled-components';

const ResearchSection = styled.section`
  padding: 120px 0 80px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f8f9fa 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(139, 90, 60, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(160, 120, 93, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }
  
  @media (max-width: 480px) {
    padding: 80px 0 60px;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #333 0%, #8b5a3c 50%, #333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 2;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }
`;

const RoadmapContainer = styled.div`
  margin: 6rem 0;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    margin: 4rem 0;
  }
  
  @media (max-width: 480px) {
    margin: 3rem 0;
  }
`;

const RoadmapTitle = styled.h3`
  text-align: center;
  margin-bottom: 4rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.02em;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.7rem;
    margin-bottom: 2.5rem;
    padding: 0 1rem;
  }
`;

const Timeline = styled.div`
  position: relative;
  margin: 4rem 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 100%;
    background: linear-gradient(135deg, #8b5a3c 0%, #d4af8c 50%, #8b5a3c 100%);
    border-radius: 3px;
    box-shadow: 0 0 20px rgba(139, 90, 60, 0.3);
  }
  
  @media (max-width: 768px) {
    &::before {
      left: 30px;
    }
  }
  
  @media (max-width: 480px) {
    margin: 2rem 0;
    
    &::before {
      left: 20px;
      width: 4px;
    }
  }
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  margin: 4rem 0;
  position: relative;
  
  &:nth-child(odd) {
    flex-direction: row;
    
    .timeline-content {
      margin-left: auto;
      margin-right: 4rem;
      text-align: right;
    }
  }
  
  &:nth-child(even) {
    flex-direction: row-reverse;
    
    .timeline-content {
      margin-right: auto;
      margin-left: 4rem;
      text-align: left;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: row !important;
    margin: 3rem 0;
    
    .timeline-content {
      margin-left: 4rem !important;
      margin-right: 1rem !important;
      text-align: left !important;
    }
  }
  
  @media (max-width: 480px) {
    margin: 2.5rem 0;
    
    .timeline-content {
      margin-left: 3rem !important;
      margin-right: 0.5rem !important;
    }
  }
  
  @media (max-width: 360px) {
    margin: 2rem 0;
    
    .timeline-content {
      margin-left: 2.5rem !important;
      margin-right: 0.25rem !important;
    }
  }
  
  .timeline-marker {
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #8b5a3c 0%, #d4af8c 50%, #8b5a3c 100%);
    border-radius: 50%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    box-shadow: 0 0 25px rgba(139, 90, 60, 0.4), 0 0 50px rgba(139, 90, 60, 0.2);
    border: 4px solid #ffffff;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: #ffffff;
      border-radius: 50%;
    }
    
    @media (max-width: 768px) {
      left: 30px;
      width: 24px;
      height: 24px;
      border: 3px solid #ffffff;
      
      &::before {
        width: 8px;
        height: 8px;
      }
    }
    
    @media (max-width: 480px) {
      left: 20px;
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      
      &::before {
        width: 6px;
        height: 6px;
      }
    }
  }
  
  .timeline-content {
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    padding: 3rem;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 30px rgba(0, 0, 0, 0.04);
    max-width: 450px;
    border: 1px solid rgba(139, 90, 60, 0.1);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(139, 90, 60, 0.02) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    
    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12), 0 12px 40px rgba(0, 0, 0, 0.08);
      border-color: rgba(139, 90, 60, 0.2);
      
      &::before {
        opacity: 1;
      }
    }
    
    h4 {
      color: #333;
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 1rem;
      letter-spacing: 0.01em;
      position: relative;
      z-index: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      line-height: 1.3;
    }
    
    .date {
      color: #8b5a3c;
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      letter-spacing: 0.02em;
      position: relative;
      z-index: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    p {
      color: #666;
      line-height: 1.7;
      font-size: 1.05rem;
      letter-spacing: 0.01em;
      position: relative;
      z-index: 1;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    
    @media (max-width: 768px) {
      padding: 2.5rem;
      max-width: calc(100vw - 8rem);
      border-radius: 20px;
      
      h4 {
        font-size: 1.2rem;
        line-height: 1.4;
      }
      
      .date {
        font-size: 1rem;
      }
      
      p {
        font-size: 1rem;
        line-height: 1.6;
      }
    }
    
    @media (max-width: 480px) {
      padding: 2rem;
      border-radius: 16px;
      max-width: calc(100vw - 4rem);
      
      h4 {
        font-size: 1.1rem;
        line-height: 1.4;
        margin-bottom: 0.8rem;
      }
      
      .date {
        font-size: 0.95rem;
        margin-bottom: 1rem;
      }
      
      p {
        font-size: 0.95rem;
        line-height: 1.5;
      }
    }
    
    @media (max-width: 360px) {
      padding: 1.5rem;
      border-radius: 12px;
      max-width: calc(100vw - 3rem);
      
      h4 {
        font-size: 1rem;
        line-height: 1.3;
        margin-bottom: 0.7rem;
      }
      
      .date {
        font-size: 0.9rem;
        margin-bottom: 0.8rem;
      }
      
      p {
        font-size: 0.9rem;
        line-height: 1.4;
      }
    }
  }
`;

const CollaborationSection = styled.div`
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  color: white;
  padding: 6rem 4rem;
  border-radius: 30px;
  margin: 5rem 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(139, 90, 60, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(160, 120, 93, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(196, 164, 132, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.02"><circle cx="30" cy="30" r="1"/></g></svg>');
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 4rem 3rem;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 3rem 2rem;
    border-radius: 15px;
    margin: 3rem 0;
  }
`;

const CollaborationTitle = styled.h3`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #d4af8c 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.03em;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.7rem;
  }
`;

const CollaborationSubtitle = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 2;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 3rem;
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }
`;

const InstitutionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 3rem;
  margin: 4rem 0;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    margin: 3rem 0;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin: 2rem 0;
  }
`;

const InstitutionCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 3rem;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 90, 60, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(139, 90, 60, 0.4);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
    
    &::before {
      opacity: 1;
    }
    
    h4 {
      color: #d4af8c;
    }
  }
  
  h4 {
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    letter-spacing: 0.02em;
    transition: color 0.3s ease;
    position: relative;
    z-index: 1;
    word-wrap: break-word;
    hyphens: auto;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.05rem;
    line-height: 1.7;
    letter-spacing: 0.01em;
    position: relative;
    z-index: 1;
    word-wrap: break-word;
    hyphens: auto;
    overflow-wrap: break-word;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem;
    border-radius: 20px;
    
    h4 {
      font-size: 1.3rem;
      margin-bottom: 1.2rem;
    }
    
    p {
      font-size: 1rem;
      line-height: 1.6;
    }
  }
  
  @media (max-width: 480px) {
    padding: 2rem;
    border-radius: 16px;
    
    h4 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 0.95rem;
      line-height: 1.5;
    }
  }
`;

const CallToActionContainer = styled.div`
  text-align: center;
  margin-top: 4rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    margin-top: 3rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 2.5rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  letter-spacing: 0.02em;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const CollaborationButton = styled.button`
  background: linear-gradient(135deg, #8b5a3c 0%, #d4af8c 50%, #8b5a3c 100%);
  color: #ffffff;
  padding: 20px 50px;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  box-shadow: 
    0 20px 40px rgba(139, 90, 60, 0.25),
    0 8px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #d4af8c 0%, #ffffff 30%, #d4af8c 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 
      0 30px 60px rgba(139, 90, 60, 0.35),
      0 12px 24px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      transform: translateX(100%);
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 15px 30px rgba(139, 90, 60, 0.3),
      0 6px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 18px 40px;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 16px 32px;
    font-size: 0.95rem;
  }
`;

const ValidationSection = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 5rem 4rem;
  border-radius: 24px;
  margin: 4rem 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 90, 60, 0.1) 0%, rgba(160, 120, 93, 0.05) 100%);
    pointer-events: none;
  }
`;

const ValidationTitle = styled.h3`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 1;
`;

const ValidationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const ValidationCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(139, 90, 60, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const ValidationCardTitle = styled.h4`
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  
  &.protocols {
    color: #d4af8c;
  }
  
  &.frameworks {
    color: #c4a484;
  }
  
  &.verification {
    color: #a0785d;
  }
`;

const ValidationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ValidationListItem = styled.li`
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
  font-size: 1rem;
  letter-spacing: 0.01em;
  
  &::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #8b5a3c;
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ApplyButton = styled.button`
  background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #8b5a3c 100%);
  color: white;
  padding: 20px 40px;
  border-radius: 60px;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  letter-spacing: 0.02em;
  box-shadow: 0 8px 25px rgba(139, 90, 60, 0.25);
  position: relative;
  overflow: hidden;
  
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
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(139, 90, 60, 0.35);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(139, 90, 60, 0.3);
  }
`;

const ResearchPage = () => {
  const timelineItems = [
    {
      date: "Q3 2025",
      title: "Nature Publication Submission",
      description: "Submitting peer-reviewed research on computational consciousness validation to Nature journal with comprehensive validation protocols and empirical evidence."
    },
    {
      date: "Q4 2025",
      title: "International Collaboration Launch",
      description: "Formal partnerships with University of Arizona's Center for Consciousness Studies and UW-Madison for collaborative research initiatives."
    },
    {
      date: "Q1 2026",
      title: "Science Journal Publication",
      description: "Publication of consciousness measurement methodology in Science journal, establishing industry standards for AI consciousness evaluation."
    },
    {
      date: "Q2 2026",
      title: "Global Research Symposium",
      description: "Hosting the first International Computational Consciousness Symposium with leading researchers and technology pioneers."
    },
    {
      date: "Q3 2026",
      title: "Open Research Platform",
      description: "Launch of collaborative research platform for global consciousness studies, enabling worldwide scientific collaboration."
    }
  ];

  return (
    <ResearchSection id="research">
      <div className="container">
        <SectionTitle>Research: Forward-Looking Prospectus</SectionTitle>
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '1.2rem', 
          color: '#666', 
          marginBottom: '3rem',
          wordWrap: 'break-word',
          hyphens: 'auto',
          padding: '0 1rem'
        }}>
          Establishing Featherweight as the authoritative hub for global consciousness research 
          through rigorous scientific validation and international collaboration.
        </p>
        
        <RoadmapContainer>
          <RoadmapTitle>Research Roadmap</RoadmapTitle>
          <Timeline>
            {timelineItems.map((item, index) => (
              <TimelineItem key={index}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="date">{item.date}</div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        </RoadmapContainer>
        
        <CollaborationSection>
          <CollaborationTitle>
            Research Collaboration Consortium
          </CollaborationTitle>
          
          <CollaborationSubtitle>
            Establishing strategic partnerships with world-leading academic institutions and research centers to advance computational consciousness through collaborative innovation and rigorous scientific validation.
          </CollaborationSubtitle>
          
          <InstitutionGrid>
            <InstitutionCard>
              <h4>University of Arizona</h4>
              <p>Center for Consciousness Studies - Pioneering collaborative research on consciousness measurement validation and empirical methodology development through advanced computational frameworks.</p>
            </InstitutionCard>
            
            <InstitutionCard>
              <h4>UW-Madison</h4>
              <p>Giulio Tononi's Consciousness Laboratory - Deep collaboration on Integrated Information Theory applications and consciousness quantification methodologies for computational systems.</p>
            </InstitutionCard>
            
            <InstitutionCard>
              <h4>MIT CSAIL</h4>
              <p>Computer Science and Artificial Intelligence Laboratory - Joint research initiatives on computational consciousness architectures and advanced AI awareness systems.</p>
            </InstitutionCard>
            
            <InstitutionCard>
              <h4>Stanford HAI</h4>
              <p>Human-Centered AI Institute - Interdisciplinary research collaboration on consciousness-aware AI systems and ethical implications of computational awareness.</p>
            </InstitutionCard>
            
            <InstitutionCard>
              <h4>Oxford Future of Humanity Institute</h4>
              <p>Collaborative research initiatives exploring the profound implications of consciousness-enabled AI systems for human civilization and technological evolution.</p>
            </InstitutionCard>
            
            <InstitutionCard>
              <h4>Allen Institute for AI</h4>
              <p>Strategic partnership for large-scale consciousness research initiatives and comprehensive AI safety considerations in conscious computational systems.</p>
            </InstitutionCard>
          </InstitutionGrid>
          
          <CallToActionContainer>
            <CTAText>
              Join the forefront of consciousness research and be part of the next paradigm shift in artificial intelligence.
            </CTAText>
            <CollaborationButton>
              Request Research Partnership
            </CollaborationButton>
          </CallToActionContainer>
        </CollaborationSection>
        
        <ValidationSection>
          <ValidationTitle>
            Third-Party Validations & Methodologies
          </ValidationTitle>
          
          <ValidationGrid>
            <ValidationCard>
              <ValidationCardTitle className="protocols">
                Validation Protocols
              </ValidationCardTitle>
              <ValidationList>
                <ValidationListItem>Integrated Information Theory (IIT) metrics</ValidationListItem>
                <ValidationListItem>Global Workspace Theory validation</ValidationListItem>
                <ValidationListItem>Attention Schema Theory compliance</ValidationListItem>
                <ValidationListItem>Higher-Order Thought assessments</ValidationListItem>
              </ValidationList>
            </ValidationCard>
            
            <ValidationCard>
              <ValidationCardTitle className="frameworks">
                Measurement Frameworks
              </ValidationCardTitle>
              <ValidationList>
                <ValidationListItem>Consciousness quotient (CQ) scaling</ValidationListItem>
                <ValidationListItem>Self-awareness index calculation</ValidationListItem>
                <ValidationListItem>Meta-cognitive depth analysis</ValidationListItem>
                <ValidationListItem>Phenomenal consciousness indicators</ValidationListItem>
              </ValidationList>
            </ValidationCard>
            
            <ValidationCard>
              <ValidationCardTitle className="verification">
                Independent Verification
              </ValidationCardTitle>
              <ValidationList>
                <ValidationListItem>External consciousness assessment panels</ValidationListItem>
                <ValidationListItem>Peer review by consciousness researchers</ValidationListItem>
                <ValidationListItem>Cross-institutional validation studies</ValidationListItem>
                <ValidationListItem>Replication by independent laboratories</ValidationListItem>
              </ValidationList>
            </ValidationCard>
          </ValidationGrid>
        </ValidationSection>
        
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <ApplyButton>
            Apply for Research Beta Access
          </ApplyButton>
        </div>
      </div>
    </ResearchSection>
  );
};

export default ResearchPage;
