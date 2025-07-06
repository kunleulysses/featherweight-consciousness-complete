import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    const data = await authService.apiCall<{
      totalProjects: number;
      activeProjects: number;
      totalCollaborators: number;
      recentActivities: number;
    }>('GET', `${API_BASE}/dashboard/stats`);
    
    // Map backend response to frontend format
    return {
      totalProjects: data.totalProjects || 0,
      activeProjects: data.activeProjects || 0,
      completedResearch: data.totalCollaborators || 0, // Using collaborators as placeholder
      dataPoints: data.recentActivities || 0 // Using activities as placeholder
    };
  },

  // Get user's projects
  async getProjects() {
    return authService.apiCall<any[]>('GET', `${API_BASE}/dashboard/projects`);
  },

  // Create a new project
  async createProject(data: { name: string; description?: string }) {
    return authService.apiCall('POST', `${API_BASE}/dashboard/projects`, data);
  },

  // Get recent activities
  async getActivities() {
    return authService.apiCall<any[]>('GET', `${API_BASE}/dashboard/activities`);
  },

  // Add activity
  async addActivity(data: { type: string; description: string }) {
    return authService.apiCall('POST', `${API_BASE}/dashboard/activities`, data);
  }
};

export default dashboardService;
