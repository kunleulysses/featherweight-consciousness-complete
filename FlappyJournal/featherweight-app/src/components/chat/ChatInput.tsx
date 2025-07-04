import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, CircularProgress } from '@mui/material';
import { Send as SendIcon, Stop as StopIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useChat } from '../../contexts/ChatContext';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const theme = useTheme();
  const { sendMessage, isGenerating, isConnected } = useChat();

  const handleSend = () => {
    if (message.trim() && !isGenerating && isConnected) {
      sendMessage(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type your message..." : "Connecting to chat server..."}
          disabled={!isConnected}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        {isGenerating ? (
          <IconButton
            color="secondary"
            disabled
            sx={{ 
              bgcolor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.secondary.dark,
              },
            }}
          >
            <CircularProgress size={24} color="inherit" />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleSend}
            disabled={!message.trim() || !isConnected}
            color="primary"
            sx={{ 
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              '&:disabled': {
                bgcolor: theme.palette.action.disabledBackground,
              },
            }}
          >
            <SendIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default ChatInput;
