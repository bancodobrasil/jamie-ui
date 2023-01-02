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
    keycloak?.login({ redirectUri: `${process.env.JAMIE_UI_BASE_URL}${location.pathname}` });
  };

  const renderLoginButton = () => {
    if (keycloak?.authenticated) {
      return (
        <Box>
          <Button onClick={onLogoutClickHandler}>Logout</Button>
        </Box>
      );
    }
    return (
      <Box>
        <Button onClick={onLoginClickHandler}>Login</Button>
      </Box>
    );
  };

  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: '2rem',
        height: '5rem',
      }}
      className="shadow"
    >
      <Box>
        <Link to="/">
          <Typography variant="h6" component="h6" sx={{ fontSize: '1.5rem' }}>
            Jamie
          </Typography>
        </Link>
      </Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1, alignItems: 'center' }}
        className="space-x-4"
      >
        {renderLanguageSwitcher()}
        {renderLoginButton()}
      </Box>
    </Box>
  );
};
