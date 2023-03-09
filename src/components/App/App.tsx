import React, { Suspense } from 'react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { useTranslation } from 'react-i18next';
import keycloak, { initOptions } from '../../keycloak';
import '../../i18n';
import '../../styles/global.css';
import theme from '../../theme';
import './AppStyles.css';
import { AppRoutes } from './AppRoutes';
import Loading from '../Loading';
import { client } from '../../api';

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
  <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>
    <Suspense fallback={<Loading />}>
      <ApolloProvider client={client}>
        <Pages />
      </ApolloProvider>
    </Suspense>
  </ReactKeycloakProvider>
);

export default App;
