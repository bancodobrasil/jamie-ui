import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PageTitle = ({ onClick, PageTitle }) => (
  <Box
    className="flex flex-row space-x-1 items-center"
    sx={{ minWidth: '10rem', height: '1.5rem', marginTop: '2.1rem', marginBottom: '1.4rem' }}
  >
    <IconButton onClick={onClick} size="small">
      <ArrowBackIcon fontSize="small" color="primary" />
    </IconButton>
    <Typography variant="h3" component="h1" sx={{ py: '1rem' }}>
      {PageTitle}
    </Typography>
  </Box>
);

export default PageTitle;
