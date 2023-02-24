import React from 'react';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Nav } from './Nav';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const { i18n } = useTranslation();
  return (
    <>
      <Helmet titleTemplate="Jamie | %s" defaultTitle="Jamie">
        <html lang={i18n.language} />
        <meta name="description" content="Jamie - Menu builder application" />
      </Helmet>
      <Box
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Nav />
        <Box
          sx={{
            height: 'calc(100% - 5rem)',
            width: '100%',
            flex: 1,
            boxSizing: 'border-box',
            paddingLeft: '32px',
            paddingRight: '32px',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
