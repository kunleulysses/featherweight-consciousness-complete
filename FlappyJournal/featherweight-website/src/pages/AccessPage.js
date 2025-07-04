import React from 'react';
import styled from 'styled-components';

const AccessSection = styled.section`
  padding: 120px 0 80px;
  background: white;
  min-height: 80vh;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #333, #8b5a3c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  margin: 4rem 0;
`;

const AccessCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient});
  color: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  .icon {
    font-size: 4rem;
    margin-bottom: 2rem;
  }
  
  h3 {
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    opacity: 0.9;
    line-height: 1.6;
  }
  
  button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid white;
    padding: 15px 30px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: white;
      color: #333;
      transform: scale(1.05);
    }
  }
`;

const ProcessSection = styled.div`
  background: #f8f9fa;
  padding: 3rem;
  border-radius: 20px;
  margin-top: 4rem;
  text-align: center;
  
  h3 {
    color: #333;
    margin-bottom: 2rem;
  }
`;

const ProcessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProcessStep = styled.div`
  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
  }
`;

const AccessPage = () => {
  const openPortal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AccessSection id="access">
      <div className="container">
        <SectionTitle>Access: Targeted Engagement</SectionTitle>
        
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
          Choose your pathway to explore consciousness AI through our specialized platforms 
          designed for researchers and commercial partners.
        </p>
        
        <AccessGrid>
          <AccessCard gradient="#8b5a3c, #a0785d">
            <div className="icon">◈</div>
            <h3>Research Portal</h3>
            <p>
              Secure research environment for validated researchers with access to 
              advanced consciousness metrics, real-time processing capabilities, 
              and comprehensive data analysis suites. Collaborate with leading 
              institutions and contribute to groundbreaking consciousness research.
            </p>
            <button onClick={() => openPortal('https://app.featherweight.world')}>
              Apply for Research Access
            </button>
          </AccessCard>
          
          <AccessCard gradient="#a0785d, #c4a484">
            <div className="icon">◆</div>
            <h3>Commercial Demo</h3>
            <p>
              Personalized demonstrations tailored to commercial partner needs, 
              showcasing custom interactive demos for healthcare, education, 
              and enterprise solutions with real-time analytics demonstrating 
              measurable ROI and transformative impact.
            </p>
            <button onClick={() => openPortal('https://demo.featherweight.world')}>
              Schedule Commercial Demo
            </button>
          </AccessCard>
        </AccessGrid>
        
        <ProcessSection>
          <h3>Application Process</h3>
          
          <ProcessGrid>
            <ProcessStep>
              <div className="icon">◉</div>
              <h4>Submit Application</h4>
              <p>
                Complete our application form with your research interests or commercial needs
              </p>
            </ProcessStep>
            
            <ProcessStep>
              <div className="icon">◈</div>
              <h4>Review Process</h4>
              <p>
                Our team reviews applications and validates research credentials or commercial fit
              </p>
            </ProcessStep>
            
            <ProcessStep>
              <div className="icon">◆</div>
              <h4>Access Granted</h4>
              <p>
                Receive secure access credentials and personalized onboarding session
              </p>
            </ProcessStep>
          </ProcessGrid>
        </ProcessSection>
      </div>
    </AccessSection>
  );
};

export default AccessPage;
