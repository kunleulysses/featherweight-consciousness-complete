import React, { useState, useEffect } from 'react';
import dataSourceService from '../../services/dataSourceService';
import './DataTab.css';

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'api' | 'database' | 'web';
  status: 'active' | 'inactive' | 'error';
  last_sync: string;
  records_count: number;
  metadata: {
    format?: string;
    size?: number;
    endpoint?: string;
    frequency?: string;
  };
}

interface DatasetSummary {
  total_sources: number;
  active_sources: number;
  total_records: number;
  last_update: string;
  storage_used: number;
}

export default function DataTab() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'file',
    metadata: {}
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sourcesData, summaryData] = await Promise.all([
        dataSourceService.getDataSources(),
        dataSourceService.getSummary()
      ]);
      setDataSources(sourcesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    try {
      await dataSourceService.createDataSource(newSource);
      await loadData();
      setShowAddForm(false);
      setNewSource({ name: '', type: 'file', metadata: {} });
    } catch (error) {
      console.error('Failed to create data source:', error);
    }
  };

  const handleSync = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dataSourceService.syncDataSource(id);
      await loadData();
    } catch (error) {
      console.error('Failed to sync data source:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this data source?')) return;
    
    try {
      await dataSourceService.deleteDataSource(id);
      await loadData();
      setSelectedSource(null);
    } catch (error) {
      console.error('Failed to delete data source:', error);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'file': return '📁';
      case 'api': return '🔌';
      case 'database': return '🗄️';
      case 'web': return '🌐';
      default: return '📊';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#28a745', text: 'Active' },
      inactive: { color: '#6c757d', text: 'Inactive' },
      error: { color: '#dc3545', text: 'Error' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="data-tab">
      <div className="data-header">
        <h2>Data Management</h2>
        <button 
          className="add-source-btn"
          onClick={() => setShowAddForm(true)}
        >
          <span>+</span>
          Add Data Source
        </button>
      </div>

      {showAddForm && (
        <div className="add-source-form">
          <h3>Add New Data Source</h3>
          <input
            type="text"
            placeholder="Source name"
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
          />
          <select
            value={newSource.type}
            onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
          >
            <option value="file">File</option>
            <option value="api">API</option>
            <option value="database">Database</option>
            <option value="web">Web</option>
          </select>
          <div className="form-actions">
            <button onClick={handleAddSource} className="save-btn">Create</button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      {summary && (
        <div className="data-summary">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <div className="summary-value">{summary.total_sources}</div>
              <div className="summary-label">Total Sources</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-value">{summary.active_sources}</div>
              <div className="summary-label">Active</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-content">
              <div className="summary-value">{summary.total_records.toLocaleString()}</div>
              <div className="summary-label">Total Records</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💾</div>
            <div className="summary-content">
              <div className="summary-value">{formatBytes(summary.storage_used)}</div>
              <div className="summary-label">Storage Used</div>
            </div>
          </div>
        </div>
      )}

      <div className="data-content">
        {loading ? (
          <div className="data-loading">
            <p>Loading data sources...</p>
          </div>
        ) : (
          <div className="sources-grid">
            {dataSources.map((source) => (
              <div 
                key={source.id} 
                className="source-card"
                onClick={() => setSelectedSource(source)}
              >
                <div className="source-header">
                  <div className="source-icon">
                    {getSourceIcon(source.type)}
                  </div>
                  <div className="source-status">
                    {getStatusBadge(source.status)}
                  </div>
                </div>
                
                <h3>{source.name}</h3>
                
                <div className="source-stats">
                  <div className="stat">
                    <span className="stat-label">Records:</span>
                    <span className="stat-value">{source.records_count.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Last Sync:</span>
                    <span className="stat-value">{formatDate(source.last_sync)}</span>
                  </div>
                </div>

                <div className="source-metadata">
                  {source.metadata.format && (
                    <div className="metadata-item">
                      <span>📄</span> {source.metadata.format}
                    </div>
                  )}
                  {source.metadata.frequency && (
                    <div className="metadata-item">
                      <span>🔄</span> {source.metadata.frequency}
                    </div>
                  )}
                  {source.metadata.size && (
                    <div className="metadata-item">
                      <span>💾</span> {formatBytes(source.metadata.size)}
                    </div>
                  )}
                </div>

                <div className="source-actions">
                  <button 
                    className="action-btn" 
                    onClick={(e) => handleSync(source.id, e)}
                  >
                    🔄 Sync Now
                  </button>
                  <button className="action-btn" onClick={(e) => {
                    e.stopPropagation();
                    console.log('Configure source:', source.id);
                  }}>
                    ⚙️ Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSource && (
        <div className="source-modal" onClick={() => setSelectedSource(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSource.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedSource(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Source Type: <strong>{selectedSource.type}</strong></p>
              <p>Status: {getStatusBadge(selectedSource.status)}</p>
              <p>Records: <strong>{selectedSource.records_count.toLocaleString()}</strong></p>
              <p>Last Sync: <strong>{formatDate(selectedSource.last_sync)}</strong></p>
              
              {selectedSource.metadata.endpoint && (
                <p>Endpoint: <code>{selectedSource.metadata.endpoint}</code></p>
              )}
              
              <div className="modal-actions">
                <button className="btn-primary">View Data</button>
                <button className="btn-secondary">Export</button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDelete(selectedSource.id)}
                >
                  Delete Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
