import { Box, Typography } from '@mui/material';
import React from 'react';

export default function Home() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        paddingTop: '16px',
        paddingBottom: '16px',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '24px',
          letterSpacing: '0.18px',
          margin: 0,
          padding: '16px',
        }}
      >
        Home
      </Typography>
    </Box>
  );
}
