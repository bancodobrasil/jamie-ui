import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Typography,
  Button,
  Menu,
} from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LanguageIcon from '@mui/icons-material/Language';
import { JAMIE_UI_BASE_URL } from '../../constants';

export const Nav = () => {
  const { keycloak } = useKeycloak();

  const location = useLocation();

  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState<string>(i18n.resolvedLanguage);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (event: React.MouseEvent<HTMLElement>, newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    setAnchorEl(null);
  };

  const renderLanguageSwitcher = () => (
    <Box sx={{ flex: 1, width: '2.7rem' }}>
      <Button
        onClick={handleMenuClick}
        variant="text"
        id="language-button"
        startIcon={
          <LanguageIcon
            sx={{
              color: '#38879c',
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
              mr: '10px',
            }}
          />
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        id="language-menu"
      >
        <MenuItem onClick={event => handleLanguageChange(event, 'en')} selected={language === 'en'}>
          English
        </MenuItem>
        <MenuItem
          onClick={event => handleLanguageChange(event, 'pt-BR')}
          selected={language === 'pt-BR'}
        >
          Português Brasileiro
        </MenuItem>
      </Menu>
    </Box>
  );

  const onLogoutClickHandler = () => {
    keycloak?.logout();
  };

  const onLoginClickHandler = () => {
    keycloak?.login({ redirectUri: `${JAMIE_UI_BASE_URL}${location.pathname}` });
  };

  /* The `renderLoginButton` function is responsible for rendering the login button based on the
authentication status of the user. */
  const renderLoginButton = () => {
    if (keycloak?.authenticated) {
      return (
        <Box>
          <Button variant="text" color="secondary" onClick={onLogoutClickHandler}>
            Logout
          </Button>
        </Box>
      );
    }
    return (
      <Box>
        <Button variant="text" color="secondary" onClick={onLoginClickHandler}>
          Login
        </Button>
      </Box>
    );
  };

  /* Return a element that represents the navigation bar component. */
  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: '2rem',
        minHeight: '3rem',
        backgroundColor: 'black',
      }}
      className="shadow"
    >
      <Box>
        <Link to="/">
          <Typography variant="h6" component="h6" sx={{ fontSize: '1.25rem', color: 'white' }}>
            Jamie
          </Typography>
        </Link>
      </Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1, alignItems: 'center' }}
        className="space-x-4"
      >
        <Box>{renderLanguageSwitcher()}</Box>
        {renderLoginButton()}
      </Box>
    </Box>
  );
};
