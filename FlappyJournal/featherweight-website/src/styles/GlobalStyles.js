import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --gradient-color: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #c4a484 100%);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #ffffff;
    color: #1a1a1a;
    line-height: 1.6;
    overflow-x: hidden;
    font-weight: 400;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.02em;
  }

  h1 {
    font-size: 4.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    
    @media (max-width: 768px) {
      font-size: 3rem;
    }
  }

  h2 {
    font-size: 3rem;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }

  h3 {
    font-size: 2rem;
    font-weight: 500;
  }

  p {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
    color: #4a4a4a;
    line-height: 1.75;
    font-weight: 400;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  button {
    border: none;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    font-family: 'Inter', sans-serif;
  }

  .luxury-gradient {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 25%, #7f8c8d 75%, #95a5a6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .accent-gradient {
    background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #c4a484 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-padding {
    padding: 120px 0;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    
    @media (max-width: 768px) {
      padding: 0 24px;
    }
  }

  .elegant-shadow {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 25px rgba(0, 0, 0, 0.06);
  }

  .luxury-border {
    border: 1px solid rgba(139, 90, 60, 0.15);
  }
`;
