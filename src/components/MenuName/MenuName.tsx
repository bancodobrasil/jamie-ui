import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MenuName = ({ onClick, menuName }) => (
  <Box
    className="flex flex-row space-x-1 items-center my-4"
    sx={{ minWidth: '10rem', height: '1.5rem', paddingTop: '2.3rem' }}
  >
    <IconButton onClick={onClick} size="small">
      <ArrowBackIcon fontSize="small" color="primary" />
    </IconButton>
    <Typography variant="h3" component="h1" sx={{ py: '1rem' }}>
      {menuName}
    </Typography>
  </Box>
);

export default MenuName;
