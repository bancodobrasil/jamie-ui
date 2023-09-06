import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Typography,
  Button,
} from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { JAMIE_UI_BASE_URL } from '../../constants';

export const Nav = () => {
  const { keycloak } = useKeycloak();

  const location = useLocation();

  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState<string>(i18n.resolvedLanguage);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const lng = event.target.value as string;
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  const renderLanguageSwitcher = () => (
    <FormControl sx={{ minWidth: 160 }}>
      <InputLabel id="demo-simple-select-label">{t('language.title')}</InputLabel>
      <Select
        variant="standard"
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={language}
        label={t('language.title')}
        onChange={handleLanguageChange}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="pt-BR">Português Brasileiro</MenuItem>
      </Select>
    </FormControl>
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
        <Button
          sx={{
            backgroundColor: '#ffffff',
            maxHeight: '2rem',
            maxWidth: '6rem',
            transition: 'background-color 0.3s, color 0.3s', // add soft transition
            '&:hover': {
              backgroundColor: '#e4e4e4',
            },
          }}
          onClick={onLoginClickHandler}
        >
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
        {renderLoginButton()}
      </Box>
    </Box>
  );
};
