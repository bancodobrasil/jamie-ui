import React, { Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useTranslation } from 'react-i18next';
import keycloak from '../../keycloak';
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
  <ReactKeycloakProvider authClient={keycloak}>
    <Suspense fallback={<Loading />}>
      <Pages />
    </Suspense>
  </ReactKeycloakProvider>
);

export default App;
