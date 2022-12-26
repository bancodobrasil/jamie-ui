import {
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Nav = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<string>(i18n.resolvedLanguage);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const lng = event.target.value as string;
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  const renderLanguageSwitcher = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
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
    </Box>
  );

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
          <Typography variant="h6" component="h6">
            Jamie
          </Typography>
        </Link>
      </Box>
      {renderLanguageSwitcher()}
    </Box>
  );
};
