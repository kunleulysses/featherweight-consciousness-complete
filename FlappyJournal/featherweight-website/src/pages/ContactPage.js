import React, { useState } from 'react';
import styled from 'styled-components';
import emailjs from '@emailjs/browser';

const ContactSection = styled.section`
  padding: 120px 0 80px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f0f0f0 100%);
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
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const ContactContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactForm = styled.form`
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(139, 90, 60, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 90, 60, 0.02) 0%, transparent 100%);
    pointer-events: none;
  }
  
  h3 {
    color: #333;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    position: relative;
    z-index: 1;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  
  label {
    display: block;
    margin-bottom: 0.8rem;
    color: #333;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.01em;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 1.2rem;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background: #ffffff;
    letter-spacing: 0.01em;
    
    &:focus {
      outline: none;
      border-color: #8b5a3c;
      box-shadow: 0 0 0 4px rgba(139, 90, 60, 0.15);
      transform: translateY(-2px);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  textarea {
    min-height: 140px;
    resize: vertical;
    font-family: inherit;
    line-height: 1.6;
  }
  
  select {
    cursor: pointer;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #8b5a3c 100%);
  color: white;
  padding: 18px 40px;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  box-shadow: 0 12px 30px rgba(139, 90, 60, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #a0785d 0%, #d4af8c 50%, #a0785d 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 40px rgba(139, 90, 60, 0.35);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(139, 90, 60, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 8px 20px rgba(139, 90, 60, 0.15);
  }
`;

const ContactInfo = styled.div`
  h3 {
    color: #333;
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
`;

const ContactMethod = styled.div`
  margin-bottom: 2.5rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(139, 90, 60, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${props => props.color}15 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.05);
    border-color: ${props => props.color}40;
    
    &::before {
      opacity: 1;
    }
  }
  
  .icon {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, ${props => props.color}, ${props => props.color}cc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
  }
  
  h4 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    position: relative;
    z-index: 1;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    font-size: 1.05rem;
    position: relative;
    z-index: 1;
  }
  
  a {
    color: ${props => props.color};
    font-weight: 600;
    text-decoration: none;
    font-size: 1.1rem;
    letter-spacing: 0.01em;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    
    &:hover {
      color: ${props => props.color}dd;
      text-decoration: underline;
    }
  }
`;

const QuickAccess = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  color: white;
  padding: 4rem 3rem;
  border-radius: 30px;
  margin: 5rem 0;
  text-align: center;
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
      radial-gradient(circle at 75% 75%, rgba(160, 120, 93, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  h3 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #ffffff 0%, #d4af8c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
  }
  
  > p {
    font-size: 1.2rem;
    margin-bottom: 3rem;
    opacity: 0.9;
    color: rgba(255, 255, 255, 0.85);
    position: relative;
    z-index: 1;
  }
`;

const AccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin: 3rem 0;
  position: relative;
  z-index: 1;
`;

const AccessCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  padding: 2.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 90, 60, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(139, 90, 60, 0.3);
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
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    transition: color 0.3s ease;
    position: relative;
    z-index: 1;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }
  
  button {
    background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 100%);
    color: white;
    padding: 14px 28px;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    font-size: 1rem;
    letter-spacing: 0.01em;
    position: relative;
    z-index: 1;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 20px rgba(139, 90, 60, 0.3);
    }
  }
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  
  &.success {
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage({ type: '', text: '' });
    
    try {
      // Method 1: EmailJS (requires setup at emailjs.com)
      // Uncomment and configure these lines after setting up EmailJS:
      /*
      const result = await emailjs.send(
        'YOUR_SERVICE_ID',     // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID',    // Replace with your EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
          to_email: 'hello@featherweight.world', // Your receiving email
        },
        'YOUR_PUBLIC_KEY'      // Replace with your EmailJS public key
      );
      
      if (result.text === 'OK') {
        setStatusMessage({
          type: 'success',
          text: 'Thank you for your message! We\'ll get back to you within 24 hours.'
        });
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('EmailJS failed');
      }
      */
      
      // Method 2: Netlify Forms (works automatically when deployed to Netlify)
      const formDataToSend = new FormData();
      formDataToSend.append('form-name', 'contact');
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formDataToSend).toString()
      });
      
      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: 'Thank you for your message! We\'ll get back to you within 24 hours.'
        });
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Form submission failed');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      setStatusMessage({
        type: 'error',
        text: 'There was an error sending your message. Please try again or email us directly.'
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <ContactSection id="contact">
      <div className="container">
        <SectionTitle>Contact: Seamless Communication</SectionTitle>
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '1.3rem', 
          color: '#666', 
          marginBottom: '4rem',
          maxWidth: '800px',
          margin: '0 auto 4rem auto',
          lineHeight: '1.6',
          letterSpacing: '0.01em',
          position: 'relative',
          zIndex: '2'
        }}>
          Ready to explore consciousness AI? Get in touch with our team for research collaboration, 
          commercial partnerships, or general inquiries.
        </p>
        
        <ContactContainer>
          <ContactForm 
            onSubmit={handleSubmit}
            name="contact"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
          >
            {/* Hidden field for Netlify Forms */}
            <input type="hidden" name="form-name" value="contact" />
            <input type="hidden" name="bot-field" />
            
            <h3>Send us a Message</h3>
            
            {statusMessage.text && (
              <StatusMessage className={statusMessage.type}>
                {statusMessage.text}
              </StatusMessage>
            )}
            
            <FormGroup>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="category">Inquiry Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="research">Research Partnerships</option>
                <option value="commercial">Commercial Opportunities</option>
                <option value="press">Press & Media</option>
                <option value="careers">Careers & Recruitment</option>
                <option value="technical">Technical Support</option>
                <option value="general">General Inquiries</option>
              </select>
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief subject of your inquiry"
              />
            </FormGroup>
            
            <FormGroup>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your interest in consciousness AI, your organization, and how we can help..."
                required
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </SubmitButton>
          </ContactForm>
          
          <ContactInfo>
            <h3>Get in Touch</h3>
            
            <ContactMethod color="#8b5a3c">
              <div className="icon">🔬</div>
              <h4>Research Partnerships</h4>
              <p>Collaborate on consciousness research and academic publications with leading institutions</p>
              <a href="mailto:research@featherweight.world">research@featherweight.world</a>
            </ContactMethod>
            
            <ContactMethod color="#a0785d">
              <div className="icon">🤝</div>
              <h4>Commercial Opportunities</h4>
              <p>Explore consciousness AI solutions for your organization and enterprise applications</p>
              <a href="mailto:partnerships@featherweight.world">partnerships@featherweight.world</a>
            </ContactMethod>
            
            <ContactMethod color="#c4a484">
              <div className="icon">📰</div>
              <h4>Press & Media</h4>
              <p>Media inquiries, press kit requests, and interview opportunities</p>
              <a href="mailto:press@featherweight.world">press@featherweight.world</a>
            </ContactMethod>
            
            <ContactMethod color="#8b5a3c">
              <div className="icon">💬</div>
              <h4>General Inquiries</h4>
              <p>Questions about consciousness AI, our technology, or general information</p>
              <a href="mailto:hello@featherweight.world">hello@featherweight.world</a>
            </ContactMethod>
          </ContactInfo>
        </ContactContainer>
        
        <QuickAccess>
          <h3>Quick Access Portals</h3>
          <p>
            Direct access to our specialized platforms for researchers and commercial partners
          </p>
          
          <AccessGrid>
            <AccessCard>
              <h4>Research Portal</h4>
              <p>
                Secure access to consciousness research tools, collaboration features, 
                and advanced analytics for validated researchers.
              </p>
              <button onClick={() => window.open('https://app.featherweight.world', '_blank')}>
                Access Research Portal
              </button>
            </AccessCard>
            
            <AccessCard>
              <h4>Commercial Demo</h4>
              <p>
                Personalized demonstrations of consciousness AI applications 
                tailored to your industry and use case.
              </p>
              <button onClick={() => window.open('https://demo.featherweight.world', '_blank')}>
                Schedule Demo
              </button>
            </AccessCard>
            
            <AccessCard>
              <h4>Developer API</h4>
              <p>
                Technical documentation and API access for integrating 
                consciousness-aware AI into your applications.
              </p>
              <button onClick={() => window.open('https://docs.featherweight.world', '_blank')}>
                View Documentation
              </button>
            </AccessCard>
          </AccessGrid>
        </QuickAccess>
      </div>
    </ContactSection>
  );
};

export default ContactPage;
