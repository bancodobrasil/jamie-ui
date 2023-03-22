import React from 'react';
import { useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';

const ListPendencies = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const { loading, error, data } = useQuery(MenuService.GET_MENU_REVISIONS, {
    variables: { id: Number(id) },
  });

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 1,
            field: t('menuRevision.title', { count: 2 }),
          }).toLowerCase(),
        })}
        description={t('error.failedToLoadResource.description')}
        button={{
          label: t('error.failedToLoadResource.button'),
          onClick: () => document.location.reload(),
        }}
      />
    );

  if (loading) return <Loading />;

  return (
    <Box>
      <Helmet>
        <title>{t('menu.pendencies.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../' },
          { label: t('menu.pendencies.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ my: '1rem' }}>
        {t('menu.pendencies.title')}
      </Typography>
      <Typography variant="body1" component="h2" sx={{ my: '0.5rem' }}>
        {t('menu.pendencies.description')}
      </Typography>
    </Box>
  );
};

export default ListPendencies;
