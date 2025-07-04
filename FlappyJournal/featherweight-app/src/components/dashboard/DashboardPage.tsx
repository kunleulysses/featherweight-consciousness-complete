import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import './DashboardPage.css';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedResearch: number;
  dataPoints: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    completedResearch: 0,
    dataPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectsData, activitiesData, statsData] = await Promise.all([
        dashboardService.getProjects(),
        dashboardService.getActivities(),
        dashboardService.getStats()
      ]);

      setProjects(projectsData);
      setActivities(activitiesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'research': return '🔬';
      case 'data': return '📊';
      case 'analysis': return '📈';
      case 'collaboration': return '👥';
      default: return '📌';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome to Featherweight</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Total Projects</h3>
              <p className="stat-value">{stats.totalProjects}</p>
            </div>
            <div className="stat-icon">📁</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Active Projects</h3>
              <p className="stat-value">{stats.activeProjects}</p>
            </div>
            <div className="stat-icon">🚀</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Completed Research</h3>
              <p className="stat-value">{stats.completedResearch}</p>
            </div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Data Points</h3>
              <p className="stat-value">{stats.dataPoints.toLocaleString()}</p>
            </div>
            <div className="stat-icon">📊</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="projects-section">
            <div className="section-header">
              <h3>Recent Projects</h3>
              <a href="#" className="view-all-link">View all</a>
            </div>
            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet</p>
                <p>Start by creating your first research project</p>
              </div>
            ) : (
              <div className="projects-list">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="project-item">
                    <div className="project-header">
                      <span className="project-name">{project.name}</span>
                      <span className={`project-status ${project.status}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="project-description">{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="activities-section">
            <div className="section-header">
              <h3>Recent Activities</h3>
              <a href="#" className="view-all-link">View all</a>
            </div>
            {activities.length === 0 ? (
              <div className="empty-state">
                <p>No activities yet</p>
                <p>Your research activities will appear here</p>
              </div>
            ) : (
              <div className="activities-list">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">{activity.description}</p>
                      <span className="activity-time">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
