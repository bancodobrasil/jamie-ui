import React, { Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import '../../i18n';
import theme from '../../theme';
import './AppStyles.css';
import { AppRoutes } from './AppRoutes';
import Loading from '../Loading';

const Pages = () => (
  <ThemeProvider theme={theme()}>
    <CssBaseline />
    <AppRoutes />
  </ThemeProvider>
);

const App = () => (
  <Suspense fallback={<Loading />}>
    <Pages />
  </Suspense>
);

export default App;
