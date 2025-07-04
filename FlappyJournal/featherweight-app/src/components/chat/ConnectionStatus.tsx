import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { 
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  CloudOff as DisconnectedIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useChat } from '../../contexts/ChatContext';

interface StatusConfig {
  icon: React.ReactNode;
  text: string;
  color: string;
}

export const ConnectionStatus: React.FC = () => {
  const theme = useTheme();
  const { isConnected, isGenerating } = useChat();

  const getStatusProps = (): StatusConfig => {
    if (isConnected) {
      return {
        icon: <ConnectedIcon />,
        text: 'Connected',
        color: theme.palette.success.main,
      };
    } else {
      return {
        icon: <DisconnectedIcon />,
        text: 'Disconnected',
        color: theme.palette.error.main,
      };
    }
  };

  const { icon, text, color } = getStatusProps();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
        {isGenerating ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          icon
        )}
      </Box>
      <Typography variant="body2" sx={{ color }}>
        {isGenerating ? 'Processing...' : text}
      </Typography>
    </Box>
  );
};

export default ConnectionStatus;
