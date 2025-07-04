import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #1a1a1a;
  color: white;
  padding: 4rem 0 2rem;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
`;

const FooterSection = styled.div`
  h4 {
    color: #a0785d;
    margin-bottom: 1.5rem;
    font-family: 'Cormorant Garamond', serif;
  }
  
  ul {
    list-style: none;
    
    li {
      margin-bottom: 0.8rem;
      
      a {
        color: #ccc;
        transition: color 0.3s ease;
        
        &:hover {
          color: #8b5a3c;
        }
      }
    }
  }
  
  p {
    color: #ccc;
    line-height: 1.6;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.3s ease;
    text-decoration: none;
    
    &:hover {
      background: linear-gradient(135deg, #8b5a3c, #a0785d);
      transform: translateY(-2px);
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #333;
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
  
  .copyright {
    color: #666;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .parent-company {
    color: #a0785d;
    font-size: 0.9rem;
    
    a {
      color: #a0785d;
      text-decoration: underline;
      transition: color 0.3s ease;
      
      &:hover {
        color: #8b5a3c;
      }
    }
  }
  
  .legal-links {
    display: flex;
    gap: 2rem;
    
    @media (max-width: 768px) {
      gap: 1rem;
    }
    
    a {
      color: #666;
      font-size: 0.9rem;
      transition: color 0.3s ease;
      
      &:hover {
        color: #a0785d;
      }
    }
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <div className="container">
        <FooterContent>
          <FooterSection>
            <h4>Featherweight AI</h4>
            <p>
              Pioneering the dawn of computational consciousness through validated 
              AI systems that understand, empathize, and collaborate with human consciousness.
            </p>
            <SocialLinks>
              <a href="https://linkedin.com/company/featherweight-ai" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                Li
              </a>
              <a href="https://twitter.com/featherweight_ai" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                Tw
              </a>
              <a href="https://github.com/featherweight-ai" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                Gh
              </a>
            </SocialLinks>
          </FooterSection>
          
          <FooterSection>
            <h4>Resources</h4>
            <ul>
              <li><a href="#research">Documentation</a></li>
              <li><a href="#research">Publications</a></li>
              <li><a href="#contact">Support</a></li>
            </ul>
          </FooterSection>
        </FooterContent>
        
        <FooterBottom>
          <div className="copyright">
            <div>© 2024 Featherweight AI. All rights reserved. Pioneering consciousness since 2024.</div>
            <div className="parent-company">
              Featherweight AI is an extension of <a href="https://august9teen.com" target="_blank" rel="noopener noreferrer">August9teen, Inc.</a> - An AI Integrations Company
            </div>
          </div>
          <div className="legal-links">
            <a href="#contact">Privacy Policy</a>
            <a href="#contact">Terms of Service</a>
          </div>
        </FooterBottom>
      </div>
    </FooterContainer>
  );
};

export default Footer;
