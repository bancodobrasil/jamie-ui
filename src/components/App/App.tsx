import React, { Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import '../../styles/global.css';
import theme from '../../theme';
import './AppStyles.css';
import { AppRoutes } from './AppRoutes';
import Loading from '../Loading';

const Pages = () => {
  const { i18n } = useTranslation();

  return (
    <ThemeProvider theme={theme(i18n.language)}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

const App = () => (
  <Suspense fallback={<Loading />}>
    <Pages />
  </Suspense>
);

export default App;
