import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';

interface Project {
  id: string;
  name: string;
  description?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  activeProject: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserProjects = createAsyncThunk(
  'project/fetchUserProjects',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await authService.getUserProjects();
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectRoles = createAsyncThunk(
  'project/fetchProjectRoles',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const roles = await authService.getProjectRoles(projectId);
      return { projectId, roles };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch project roles');
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setActiveProject: (state, action: PayloadAction<Project | null>) => {
      state.activeProject = action.payload;
      
      // Update localStorage for persistence across sessions
      if (action.payload) {
        localStorage.setItem('activeProjectId', action.payload.id);
      } else {
        localStorage.removeItem('activeProjectId');
      }
    },
    updateProjectRoles: (state, action: PayloadAction<{ projectId: string; roles: string[] }>) => {
      const { projectId, roles } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.roles = roles;
      }
      
      // Update active project if it's the same
      if (state.activeProject?.id === projectId) {
        state.activeProject.roles = roles;
      }
    },
    clearProjects: (state) => {
      state.projects = [];
      state.activeProject = null;
      state.error = null;
      localStorage.removeItem('activeProjectId');
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProjects
      .addCase(fetchUserProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        
        // Set active project from localStorage if it exists in projects
        const activeProjectId = localStorage.getItem('activeProjectId');
        if (activeProjectId) {
          const activeProject = action.payload.find((p: Project) => p.id === activeProjectId);
          if (activeProject) {
            state.activeProject = activeProject;
          }
        }
        
        // If no active project but user has projects, set the first one as active
        if (!state.activeProject && action.payload.length > 0) {
          state.activeProject = action.payload[0];
          localStorage.setItem('activeProjectId', action.payload[0].id);
        }
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchProjectRoles
      .addCase(fetchProjectRoles.fulfilled, (state, action) => {
        const { projectId, roles } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.roles = roles;
        }
        
        if (state.activeProject?.id === projectId) {
          state.activeProject.roles = roles;
        }
      })
      .addCase(fetchProjectRoles.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveProject,
  updateProjectRoles,
  clearProjects,
  setError,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer;
