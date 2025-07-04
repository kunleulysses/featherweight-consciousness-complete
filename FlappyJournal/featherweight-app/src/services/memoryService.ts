import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const memoryService = {
  // Get project memory items
  async getProjectMemory(projectId: string) {
    return authService.apiCall<any[]>('GET', `${API_BASE}/memory/projects/${projectId}/memory`);
  },

  // Add or update memory item
  async saveMemoryItem(projectId: string, data: { key: string; value: any; category: string }) {
    return authService.apiCall(
      'POST', 
      `${API_BASE}/memory/projects/${projectId}/memory`,
      data
    );
  },

  // Delete memory item
  async deleteMemoryItem(projectId: string, key: string) {
    return authService.apiCall(
      'DELETE',
      `${API_BASE}/memory/projects/${projectId}/memory/${key}`
    );
  }
};

export default memoryService;
