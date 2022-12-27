import React from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import { Nav } from '../../Nav';
import { ListMenu } from '../../../pages/Menu/List';

export const AppRoutes = () => (
  <Router>
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
        <NotificationProvider>
          <Routes>
            <Route index element={<Navigate to="/menus" replace />} />
            <Route path="menus">
              <Route index element={<ListMenu />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </Box>
    </Box>
  </Router>
);
