import { Box, CircularProgress, IconButton } from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = ({ onClick }) => (
  <Box>
    <IconButton onClick={onClick} size="small">
      <ArrowBackIcon fontSize="small" color="primary" />
    </IconButton>
  </Box>
);

export default BackButton;
