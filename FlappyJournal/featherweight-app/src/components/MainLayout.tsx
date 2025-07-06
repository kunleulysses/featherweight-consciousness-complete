import React, { useState } from 'react';
import DashboardPage from './dashboard/DashboardPage';
import ResearchTab from './research/ResearchTab';
import DataTab from './data/DataTab';
import './MainLayout.css';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'research' | 'data'>('dashboard');

  return (
    <div className="main-layout">
      <header className="app-header">
        <div className="header-left">
          <h1>Featherweight</h1>
          <nav className="tab-nav">
            <button
              className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Live Metrics Dashboard
            </button>
            <button
              className={`tab-button ${activeTab === 'research' ? 'active' : ''}`}
              onClick={() => setActiveTab('research')}
            >
              Research
            </button>
            <button
              className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              Data
            </button>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-info">
            Welcome to Featherweight
          </span>
        </div>
      </header>

      <main className="app-content">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'research' && <ResearchTab />}
        {activeTab === 'data' && <DataTab />}
      </main>
    </div>
  );
}
