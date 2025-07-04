import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Storage,
  FileUpload,
  MoreVert,
  CloudUpload,
  Assessment,
  GetApp,
  Delete,
} from '@mui/icons-material';

export const DataPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const datasets = [
    {
      id: '1',
      name: 'consciousness_patterns_v2.csv',
      size: '2.4 MB',
      rows: 15420,
      columns: 24,
      uploadedAt: '2024-01-15',
      status: 'Ready',
      format: 'CSV',
      project: 'Consciousness Pattern Analysis',
    },
    {
      id: '2',
      name: 'recruitment_data_2024.xlsx',
      size: '1.8 MB',
      rows: 8950,
      columns: 18,
      uploadedAt: '2024-01-14',
      status: 'Processing',
      format: 'XLSX',
      project: 'AI Recruitment Optimization',
    },
    {
      id: '3',
      name: 'neurodivergent_assessments.json',
      size: '5.2 MB',
      rows: 3210,
      columns: 45,
      uploadedAt: '2024-01-12',
      status: 'Ready',
      format: 'JSON',
      project: 'Neurodivergent Assessment Tools',
    },
    {
      id: '4',
      name: 'brain_injury_scans.csv',
      size: '12.1 MB',
      rows: 28760,
      columns: 32,
      uploadedAt: '2024-01-10',
      status: 'Ready',
      format: 'CSV',
      project: 'Neurodivergent Assessment Tools',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'success';
      case 'Processing':
        return 'warning';
      case 'Error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Data Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload, manage, and analyze your research datasets
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<FileUpload />} size="large">
          Upload Dataset
        </Button>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: '#8B4513', mx: 'auto', mb: 2 }}>
              <Storage />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {datasets.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Datasets
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: '#A0522D', mx: 'auto', mb: 2 }}>
              <CloudUpload />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              21.5
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Size (MB)
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: '#CD853F', mx: 'auto', mb: 2 }}>
              <Assessment />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              56,340
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Rows
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: '#DEB887', mx: 'auto', mb: 2 }}>
              <GetApp />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ready for Analysis
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Datasets Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Datasets
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dataset</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Rows</TableCell>
                  <TableCell>Columns</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datasets.map((dataset) => (
                  <TableRow key={dataset.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storage sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {dataset.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dataset.project}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={dataset.format} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{dataset.size}</TableCell>
                    <TableCell>{dataset.rows.toLocaleString()}</TableCell>
                    <TableCell>{dataset.columns}</TableCell>
                    <TableCell>{dataset.uploadedAt}</TableCell>
                    <TableCell>
                      <Chip
                        label={dataset.status}
                        size="small"
                        color={getStatusColor(dataset.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Assessment sx={{ mr: 2 }} />
          Analyze
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <GetApp sx={{ mr: 2 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};
