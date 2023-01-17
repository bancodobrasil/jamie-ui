import React from 'react';
import { Box } from '@mui/material';
import { Nav } from './Nav';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => (
  <Box
    sx={{
      flex: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
    }}
  >
    <Nav />
    <Box
      sx={{
        width: '100%',
        flex: 1,
        boxSizing: 'border-box',
        paddingLeft: '32px',
        paddingRight: '32px',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default Layout;
