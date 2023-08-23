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

  const renderLoginButton = () => {
    if (keycloak?.authenticated) {
      return (
        <Box>
          <Button sx={{
          backgroundColor: '#ffffff',          
          transition: 'background-color 0.3s, color 0.3s', // Adiciona uma transição suave
          '&:hover': {
            backgroundColor: '#e4e4e4', // Cor de fundo quando o mouse está sobre o botão
          },
        }} onClick={onLogoutClickHandler}>Logout</Button>
        </Box>
      );
    }
    return (
      <Box>
        <Button sx={{ 
          backgroundColor: '#ffffff', // cor de fundo do botão         
          transition: 'background-color 0.3s, color 0.3s', // Adiciona uma transição suave
          '&:hover': {
            backgroundColor: '#e4e4e4'} // Cor de fundo quando o mouse está sobre o botão
          }} onClick={onLoginClickHandler}>Login</Button>
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
        minHeight: '5rem',
        backgroundColor: 'black',
      }}
      className="shadow"
    >
      <Box >
        <Link to="/">
          <Typography variant="h6" component="h6" sx={{ fontSize: '2rem', color: 'white'}}>
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
