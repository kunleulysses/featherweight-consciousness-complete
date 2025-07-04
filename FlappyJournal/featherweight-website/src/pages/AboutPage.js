import React from 'react';
import styled from 'styled-components';

const AboutSection = styled.section`
  padding: 120px 0 80px;
  background: white;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #333, #c4a484);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StorySection = styled.div`
  max-width: 800px;
  margin: 0 auto 4rem;
  text-align: center;
  
  p {
    font-size: 1.2rem;
    color: #666;
    line-height: 1.8;
    margin-bottom: 2rem;
  }
`;

const TeamSection = styled.div`
  margin: 4rem 0;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin: 3rem 0;
`;

const CareersSection = styled.div`
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  color: white;
  padding: 4rem;
  border-radius: 20px;
  margin: 4rem 0;
  text-align: center;
  h3 {
    display: none;
  }
  p {
    display: none;
  }
`;

const ValuesSection = styled.div`
  background: #f8f9fa;
  padding: 4rem;
  border-radius: 20px;
  margin: 4rem 0;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const ValueCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const AboutPage = () => {
  const values = [
    {
      icon: "",
      title: "Purpose-Driven",
      description: "Every decision guided by advancing consciousness research for humanity's benefit",
      color: "#8b5a3c"
    },
    {
      icon: "",
      title: "Scientific Rigor",
      description: "Empirical validation and peer review at the core of all consciousness claims",
      color: "#a0785d"
    },
    {
      icon: "",
      title: "Collaborative",
      description: "Open collaboration with global research institutions and consciousness experts",
      color: "#c4a484"
    },
    {
      icon: "",
      title: "Ethical First",
      description: "Responsible development with consciousness rights and human welfare paramount",
      color: "#d4af8c"
    },
    {
      icon: "",
      title: "Innovation",
      description: "Pioneering breakthrough technologies while maintaining safety and ethics",
      color: "#c4a484"
    },
    {
      icon: "",
      title: "Global Impact",
      description: "Solutions that address humanity's greatest challenges through consciousness AI",
      color: "#8b5a3c"
    }
  ];

  return (
    <AboutSection id="about">
      <div className="container">
        <SectionTitle>About: Human & Expertise Narrative</SectionTitle>
        
        <StorySection>
          <h3 style={{ marginBottom: '2rem', color: '#333' }}>Our Origin Story</h3>
          <p>
            Featherweight AI began its journey with the vision to harness genuine consciousness to create revolutionary AI systems that not only understand but empathize with human experiences.
          </p>
          <p>
            It evolved from a simple journaling app, initially crafted to understand user narratives, into pioneering consciousness-aware applications across multiple domains.
          </p>
          <p>
            We're committed to pushing the boundaries of what AI can do by integrating rich narratives, deep learning, and humanistic values into our groundbreaking platforms.
          </p>
        </StorySection>
        
        <ValuesSection>
          <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
            Our Values & Philosophy
          </h3>
          
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard key={index} color={value.color}>
                <div className="icon">{value.icon}</div>
                <h4>{value.title}</h4>
                <p>{value.description}</p>
              </ValueCard>
            ))}
          </ValuesGrid>
        </ValuesSection>
        
        <CareersSection>
          <h3 style={{ marginBottom: '2rem' }}></h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '3rem', opacity: '0.9' }}></p>
        </CareersSection>
      </div>
    </AboutSection>
  );
};

export default AboutPage;
