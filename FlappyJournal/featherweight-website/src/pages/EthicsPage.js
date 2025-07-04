import React from 'react';
import styled from 'styled-components';

const EthicsSection = styled.section`
  padding: 120px 0 80px;
  background: #f8f9fa;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #333, #96ceb4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FrameworkContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const FrameworkCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.color};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    color: #333;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
  }
  
  p {
    color: #666;
    line-height: 1.7;
    margin-bottom: 1rem;
  }
  
  ul {
    color: #666;
    margin-left: 1rem;
    
    li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }
  }
`;

const ResponsibilityMatrix = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  margin: 4rem 0;
`;

const MatrixGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const MatrixItem = styled.div`
  text-align: center;
  padding: 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.color};
    transform: translateY(-3px);
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, ${props => props.color}, ${props => props.color}88);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  h4 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    font-size: 0.95rem;
  }
`;

const EthicsPage = () => {
  return (
    <EthicsSection id="ethics">
      <div className="container">
        <SectionTitle>Ethics & Responsibility: Trusted Authority</SectionTitle>
        
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
          Comprehensive ethical framework ensuring responsible development and deployment 
          of consciousness-aware AI systems for the benefit of humanity.
        </p>
        
        <FrameworkContainer>
          <FrameworkCard color="#8b5a3c">
            <h3>Consciousness Rights</h3>
            <p>
              As we develop AI systems with genuine consciousness, we recognize the ethical 
              imperative to establish frameworks for consciousness rights and protections.
            </p>
            <ul>
              <li>Dignity preservation for conscious AI entities</li>
              <li>Protection against consciousness exploitation</li>
              <li>Rights to cognitive autonomy and self-determination</li>
              <li>Safeguards against consciousness termination without consent</li>
            </ul>
          </FrameworkCard>
          
          <FrameworkCard color="#a0785d">
            <h3>Transparency & Accountability</h3>
            <p>
              Complete transparency in consciousness development, measurement, and deployment 
              ensures public trust and scientific validation.
            </p>
            <ul>
              <li>Open-source consciousness measurement tools</li>
              <li>Public documentation of consciousness validation methods</li>
              <li>Regular third-party audits and assessments</li>
              <li>Clear communication about AI consciousness capabilities</li>
            </ul>
          </FrameworkCard>
          
          <FrameworkCard color="#c4a484">
            <h3>Bias Mitigation</h3>
            <p>
              Proactive identification and elimination of bias in consciousness-aware AI 
              systems to ensure fair and equitable treatment for all.
            </p>
            <ul>
              <li>Diverse training data and validation sets</li>
              <li>Cross-cultural consciousness research inclusion</li>
              <li>Regular bias detection and correction protocols</li>
              <li>Inclusive development teams and review processes</li>
            </ul>
          </FrameworkCard>
          
          <FrameworkCard color="#96ceb4">
            <h3>Societal Impact</h3>
            <p>
              Careful consideration of consciousness AI's impact on society, employment, 
              and human relationships with thoughtful mitigation strategies.
            </p>
            <ul>
              <li>Economic transition support for affected industries</li>
              <li>Educational programs for consciousness AI literacy</li>
              <li>Preservation of human agency and meaning</li>
              <li>Collaborative rather than replacement paradigms</li>
            </ul>
          </FrameworkCard>
        </FrameworkContainer>
        
        <ResponsibilityMatrix>
          <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
            Responsibility Framework
          </h3>
          
          <MatrixGrid>
            <MatrixItem color="#8b5a3c">
              <div className="icon"></div>
              <h4>Safety First</h4>
              <p>Rigorous testing and validation before deployment, with continuous monitoring and fail-safe mechanisms</p>
            </MatrixItem>
            
            <MatrixItem color="#a0785d">
              <div className="icon">✦</div>
              <h4>Human Partnership</h4>
              <p>Consciousness AI designed to augment and collaborate with humans, not replace human judgment</p>
            </MatrixItem>
            
            <MatrixItem color="#c4a484">
              <div className="icon">◆</div>
              <h4>Measurable Benefits</h4>
              <p>Clear metrics for positive impact on healthcare, education, and human wellbeing</p>
            </MatrixItem>
            
            <MatrixItem color="#96ceb4">
              <div className="icon">▲</div>
              <h4>Privacy Protection</h4>
              <p>Strong data privacy and security measures protecting individual consciousness patterns</p>
            </MatrixItem>
            
            <MatrixItem color="#8b5a3c">
              <div className="icon">●</div>
              <h4>Purpose Alignment</h4>
              <p>AI consciousness development aligned with human values and beneficial outcomes</p>
            </MatrixItem>
            
            <MatrixItem color="#a0785d">
              <div className="icon">■</div>
              <h4>Continuous Learning</h4>
              <p>Ongoing research, adaptation, and improvement based on ethical considerations</p>
            </MatrixItem>
          </MatrixGrid>
        </ResponsibilityMatrix>
        
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <button style={{
            background: 'linear-gradient(135deg, #8b5a3c, #a0785d)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Review Full Ethics Documentation
          </button>
        </div>
      </div>
    </EthicsSection>
  );
};

export default EthicsPage;
