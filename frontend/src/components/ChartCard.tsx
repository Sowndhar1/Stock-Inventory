import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, height = 300 }) => {
  const theme = useTheme();

  return (
    <Paper sx={{ 
      p: 3, 
      boxShadow: 2, 
      height: height,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="h6" fontWeight={600} mb={2} color="primary">
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartCard; 