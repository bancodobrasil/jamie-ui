import { Alert, Box, Snackbar, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React, { useState } from 'react';

const MenuIndex = ({
  MenuData,
  textVersion,
  textUUID,
  textMustDeferChanges,
  MustDeferChanges,
  textAlert,
  infoVersion,
}) => {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = data => {
    setIsCopied(true);
    setIsSnackbarOpen(true);
    navigator.clipboard.writeText(data.menu.uuid);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleSnackbarClose = reason => {
    if (reason) {
      return;
    }
    setIsSnackbarOpen(false);
  };

  return (
    <Box
      className="flex flex-row space-x-1 items-center"
      sx={{ minWidth: '10rem', height: '1.5rem', marginTop: '2.1rem', marginBottom: '1.4rem' }}
    >
      {/* details about menu */}
      <Box className="flex flex-row space-x-1" sx={{ justifyContent: 'flex-start' }}>
        {/* last version */}
        <Box sx={{ marginRight: '4rem', color: '#6C7077' }}>
          <Box>
            {textVersion}
            <Typography variant="body1" component="p" sx={{ color: '#111214', width: '7.2rem' }}>
              {infoVersion}
            </Typography>
          </Box>
        </Box>
        {/* UUID */}
        <Box sx={{ paddingRight: '4rem', color: '#6C7077', height: '2.4rem', width: '23.3rem' }}>
          <ContentCopyIcon sx={{ color: '#022831' }} onClick={() => handleCopyClick(MenuData)} />
          {textUUID}
          <Box
            sx={{
              color: '#111214',
              fontWeight: '500',
              paddingLeft: '1.5rem',
              marginTop: '-5px',
            }}
          >
            <b>{MenuData.menu.uuid}</b>
          </Box>
        </Box>
        <Snackbar open={isSnackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
            {textAlert}
          </Alert>
        </Snackbar>
        {/* Defer changes */}
        <Box sx={{ color: '#6C7077', height: '2.4rem', width: '9.5rem' }}>
          {textMustDeferChanges}
          <Box sx={{ color: '#111214' }}>{MustDeferChanges}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MenuIndex;
