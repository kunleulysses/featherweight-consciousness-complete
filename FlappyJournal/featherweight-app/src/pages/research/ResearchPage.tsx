import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { Science, Add, Group, Timeline } from '@mui/icons-material';

export const ResearchPage: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: 'Consciousness Pattern Analysis',
      description: 'Advanced neural network analysis of consciousness indicators in clinical settings',
      status: 'Active',
      progress: 75,
      collaborators: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'],
      tags: ['Machine Learning', 'Neuroscience', 'Clinical'],
      lastUpdated: '2 hours ago',
    },
    {
      id: 2,
      title: 'AI Recruitment Optimization',
      description: 'Machine learning algorithms for optimizing candidate screening processes',
      status: 'Active',
      progress: 45,
      collaborators: ['Dr. Davis', 'Dr. Miller'],
      tags: ['AI', 'HR Technology', 'Optimization'],
      lastUpdated: '1 day ago',
    },
    {
      id: 3,
      title: 'Neurodivergent Assessment Tools',
      description: 'Diagnostic tools for brain injury evaluation and neurodivergent assessment',
      status: 'Completed',
      progress: 100,
      collaborators: ['Dr. Brown', 'Dr. Wilson', 'Dr. Taylor', 'Dr. Anderson', 'Dr. Thomas'],
      tags: ['Neurology', 'Diagnostics', 'Assessment'],
      lastUpdated: '3 days ago',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Research Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your research projects and collaborations
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} size="large">
          New Project
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {projects.map((project) => (
          <Card key={project.id} sx={{ minWidth: 350, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8B4513' }}>
                  <Science />
                </Avatar>
                <Chip
                  label={project.status}
                  size="small"
                  color={project.status === 'Active' ? 'primary' : 'success'}
                  variant="outlined"
                />
              </Box>

              <Typography variant="h6" gutterBottom>
                {project.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {project.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Timeline sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    Progress: {project.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={project.progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Group sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    {project.collaborators.length} Collaborators
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {project.collaborators.slice(0, 2).join(', ')}
                  {project.collaborators.length > 2 && ` +${project.collaborators.length - 2} more`}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {project.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary">
                Updated {project.lastUpdated}
              </Typography>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
              <Button fullWidth variant="outlined">
                View Details
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
