import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const dataSourceService = {
  // Get all data sources
  async getDataSources() {
    return authService.apiCall<any[]>('GET', `${API_BASE}/datasources`);
  },

  // Get data sources summary
  async getSummary() {
    return authService.apiCall<{
      total_sources: number;
      active_sources: number;
      total_records: number;
      storage_used: number;
      last_update: string;
    }>('GET', `${API_BASE}/datasources/summary`);
  },

  // Create new data source
  async createDataSource(data: { name: string; type: string; metadata?: any }) {
    return authService.apiCall('POST', `${API_BASE}/datasources`, data);
  },

  // Update data source
  async updateDataSource(id: string, data: { name?: string; metadata?: any; status?: string }) {
    return authService.apiCall('PUT', `${API_BASE}/datasources/${id}`, data);
  },

  // Sync data source
  async syncDataSource(id: string) {
    return authService.apiCall('POST', `${API_BASE}/datasources/${id}/sync`);
  },

  // Delete data source
  async deleteDataSource(id: string) {
    return authService.apiCall('DELETE', `${API_BASE}/datasources/${id}`);
  }
};

export default dataSourceService;
