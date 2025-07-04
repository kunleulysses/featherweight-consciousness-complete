import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import memoryService from '../../services/memoryService';
import './MemoryInspector.css';

interface MemoryItem {
  id: string;
  key: string;
  value: any;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function MemoryInspector() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    key: '',
    value: '',
    category: 'context'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectMemory(selectedProject);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const projectsData = await dashboardService.getProjects();
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadProjectMemory = async (projectId: string) => {
    try {
      setLoading(true);
      const memoryData = await memoryService.getProjectMemory(projectId);
      setMemories(memoryData);
    } catch (error) {
      console.error('Failed to load project memory:', error);
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async () => {
    if (!selectedProject || !newMemory.key || !newMemory.value) return;

    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(newMemory.value);
      } catch {
        parsedValue = newMemory.value;
      }

      await memoryService.saveMemoryItem(selectedProject, {
        key: newMemory.key,
        value: parsedValue,
        category: newMemory.category
      });

      await loadProjectMemory(selectedProject);
      setShowAddForm(false);
      setNewMemory({ key: '', value: '', category: 'context' });
    } catch (error) {
      console.error('Failed to add memory:', error);
    }
  };

  const handleDeleteMemory = async (key: string) => {
    if (!selectedProject) return;

    try {
      await memoryService.deleteMemoryItem(selectedProject, key);
      await loadProjectMemory(selectedProject);
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'context': return '📄';
      case 'sources': return '💾';
      case 'insights': return '📈';
      case 'metadata': return '#️⃣';
      default: return '🧠';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="memory-container">
      <div className="memory-header">
        <div className="memory-title">
          <span>🧠</span>
          <h3>Project Memory Inspector</h3>
        </div>
        <div className="memory-controls">
          {projects.length > 0 && (
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="project-selector"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          <button 
            className="add-memory-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Memory
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-memory-form">
          <h4>Add New Memory Item</h4>
          <input
            type="text"
            placeholder="Key (e.g., project_goals)"
            value={newMemory.key}
            onChange={(e) => setNewMemory({ ...newMemory, key: e.target.value })}
          />
          <textarea
            placeholder="Value (JSON or text)"
            value={newMemory.value}
            onChange={(e) => setNewMemory({ ...newMemory, value: e.target.value })}
            rows={4}
          />
          <select
            value={newMemory.category}
            onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
          >
            <option value="context">Context</option>
            <option value="sources">Sources</option>
            <option value="insights">Insights</option>
            <option value="metadata">Metadata</option>
          </select>
          <div className="form-actions">
            <button onClick={handleAddMemory} className="save-btn">Save</button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <div className="memory-content">
        {loading ? (
          <div className="memory-empty">
            <p>Loading memory...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="memory-empty">
            <span className="memory-empty-icon">🧠</span>
            <p>No memory items found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#999' }}>
              Memory will be populated as you work with the project
            </p>
          </div>
        ) : (
          <div className="memory-list">
            {memories.map((memory) => (
              <div key={memory.id} className="memory-item">
                <div className="memory-item-header">
                  <div className="memory-item-title">
                    <div className={`memory-icon category-${memory.category}`}>
                      {getCategoryIcon(memory.category)}
                    </div>
                    <h4>{memory.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                  </div>
                  <div className="memory-item-actions">
                    <span className="category-badge">{memory.category}</span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteMemory(memory.key)}
                      title="Delete memory item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="memory-value">
                  <pre>{JSON.stringify(memory.value, null, 2)}</pre>
                </div>
                
                <div className="memory-meta">
                  <div className="memory-date">
                    <span>📅</span>
                    <span>Created: {formatDate(memory.created_at)}</span>
                  </div>
                  {memory.updated_at !== memory.created_at && (
                    <div className="memory-date">
                      <span>📅</span>
                      <span>Updated: {formatDate(memory.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
