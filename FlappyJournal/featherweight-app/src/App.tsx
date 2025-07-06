import React, { useState } from 'react';
import { MetricsProvider } from './contexts/MetricsContext';
import { ChatProvider } from './contexts/ChatContext';
import ResearchTab from './components/research/ResearchTab';
import DashboardPage from './components/dashboard/DashboardPage';
import UnifiedConsciousnessDashboard from './components/dashboard/UnifiedConsciousnessDashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'research' | 'metrics' | 'consciousness'>('research');

  return (
    <MetricsProvider>
      <ChatProvider>
        <div className="App">
          <header className="App-header">
            <h1>FlappyJournal</h1>
            <div className="tab-navigation">
              <button 
                className={activeTab === 'research' ? 'active' : ''} 
                onClick={() => setActiveTab('research')}
              >
                Research
              </button>
              <button 
                className={activeTab === 'metrics' ? 'active' : ''} 
                onClick={() => setActiveTab('metrics')}
              >
                Live Metrics
              </button>
              <button 
                className={activeTab === 'consciousness' ? 'active' : ''} 
                onClick={() => setActiveTab('consciousness')}
              >
                Consciousness System
              </button>
            </div>
          </header>
          
          <main className="App-main">
            {activeTab === 'research' && <ResearchTab />}
            {activeTab === 'metrics' && <DashboardPage />}
            {activeTab === 'consciousness' && <UnifiedConsciousnessDashboard />}
          </main>
        </div>
      </ChatProvider>
    </MetricsProvider>
  );
}

export default App;
