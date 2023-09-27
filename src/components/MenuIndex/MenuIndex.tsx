import { Alert, Box, Snackbar, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React from 'react';

const MenuIndex = ({ MenuData, textVersion, textUUID, textMustDeferChanges, MustDeferChanges }) => (
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
            <b>{MenuData?.menu.publishedRevision?.id || '-'}</b>
          </Typography>
        </Box>
      </Box>
      {/* UUID */}
      <Box sx={{ paddingRight: '4rem', color: '#6C7077', height: '2.4rem', width: '23.3rem' }}>
        <ContentCopyIcon sx={{ color: '#022831' }} />
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
      {/* <Snackbar open={isSnackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
          {t('menu.fields.copy_menu_uuid')}
        </Alert>
      </Snackbar> */}
      {/* Defer changes */}
      <Box sx={{ color: '#6C7077', height: '2.4rem', width: '9.5rem' }}>
        {textMustDeferChanges}
        <Box sx={{ color: '#111214' }}>{MustDeferChanges}</Box>
      </Box>
    </Box>
  </Box>
);

export default MenuIndex;
