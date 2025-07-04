import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ChatMessageData {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
  isGenerating?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isGenerating }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 2,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          maxWidth: '70%',
          p: 2,
          backgroundColor: isUser
            ? theme.palette.primary.main
            : theme.palette.grey[100],
          color: isUser
            ? theme.palette.primary.contrastText
            : theme.palette.text.primary,
          borderRadius: 2,
          borderTopRightRadius: isUser ? 0 : 16,
          borderTopLeftRadius: isUser ? 16 : 0,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </Typography>
        {isGenerating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.3 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="caption" sx={{ ml: 1 }}>
              Thinking...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChatMessage;
