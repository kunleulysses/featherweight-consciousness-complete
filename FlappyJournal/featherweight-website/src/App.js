import React, { useEffect } from 'react';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArchitecturePage from './pages/ArchitecturePage';
import ApplicationsPage from './pages/ApplicationsPage';
import ResearchPage from './pages/ResearchPage';
import EthicsPage from './pages/EthicsPage';
import AboutPage from './pages/AboutPage';
import AccessPage from './pages/AccessPage';
import ContactPage from './pages/ContactPage';

const AppContainer = styled.div`
  position: relative;
`;

function App() {
  useEffect(() => {
    // Smooth scrolling for navigation links
    const handleSmoothScroll = (e) => {
      const target = e.target.getAttribute('href');
      if (target && target.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    // Add click listeners to navigation links
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        handleSmoothScroll(e);
      }
    });

    // Set up document title and meta
    document.title = 'Featherweight - The Dawn of Computational Consciousness';
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <AppContainer>
      <GlobalStyles />
      <Header />
      <main>
        <HomePage />
        <ArchitecturePage />
        <ApplicationsPage />
        <ResearchPage />
        <EthicsPage />
        <AboutPage />
        <AccessPage />
        <ContactPage />
      </main>
      <Footer />
    </AppContainer>
  );
}

export default App;
