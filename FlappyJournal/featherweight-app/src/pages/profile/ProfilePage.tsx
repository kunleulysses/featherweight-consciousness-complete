import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { Edit, Save, Cancel, Settings } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    organization: user?.organization || '',
    researchAreas: user?.researchAreas || [],
  });
  const [currentArea, setCurrentArea] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResearchArea = () => {
    if (currentArea.trim() && !formData.researchAreas.includes(currentArea.trim())) {
      setFormData(prev => ({
        ...prev,
        researchAreas: [...prev.researchAreas, currentArea.trim()]
      }));
      setCurrentArea('');
    }
  };

  const handleRemoveResearchArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      researchAreas: prev.researchAreas.filter(a => a !== area)
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setEditing(false);
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      organization: user?.organization || '',
      researchAreas: user?.researchAreas || [],
    });
    setEditing(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and research preferences
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Research Areas" />
            <Tab label="Security" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#8B4513',
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Typography variant="h6">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Personal Information</Typography>
                {!editing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Research Areas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your areas of research interest to help with project recommendations and collaboration opportunities.
          </Typography>

          {editing && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., Machine Learning, Neuroscience"
                  value={currentArea}
                  onChange={(e) => setCurrentArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddResearchArea()}
                />
                <Button
                  onClick={handleAddResearchArea}
                  variant="outlined"
                  size="small"
                >
                  Add
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.researchAreas.map((area) => (
              <Chip
                key={area}
                label={area}
                onDelete={editing ? () => handleRemoveResearchArea(area) : undefined}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your account security and password settings.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Card variant="outlined" sx={{ minWidth: 250, flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Last updated: Never
                </Typography>
                <Button variant="outlined" size="small">
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ minWidth: 250, flex: 1 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Not enabled
                </Typography>
                <Button variant="outlined" size="small">
                  Enable 2FA
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};
