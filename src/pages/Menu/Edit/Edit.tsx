import { useQuery } from '@apollo/client';
import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { MenuForm } from '../../../components/Menu/Form';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { IMenuMetaWithErrors } from '../../../types';

export const EditMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const onBackClickHandler = () => {
    navigate('../');
  };

  const { dispatch } = React.useContext(NotificationContext);

  const [name, setName] = React.useState<string>(data?.menu.name || '');
  const [nameError, setNameError] = React.useState<string>('');

  const [meta, setMeta] = React.useState<IMenuMetaWithErrors[]>(
    () => data?.menu.meta.map(m => ({ ...m, errors: {} })) || [],
  );

  const onSubmit = async () => {
    // TODO: Implement the API request.
    // The Promise below simulates the loading time of the request, remove it when you implement the request itself.
    try {
      await MenuService.updateMenu({ name, meta });
      dispatch({
        type: ActionTypes.OPEN_NOTIFICATION,
        message: `${t('notification.editSuccess', {
          resource: t('menu.title', { count: 1 }),
          context: 'male',
        })}!`,
      });
      navigate('../');
    } catch (error) {
      openDefaultErrorNotification(error, dispatch);
    }
  };

  if (loading) return <Loading />;

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 1,
            field: t('menu.title', { count: 1 }),
          }).toLowerCase(),
        })}
        description={t('error.failedToLoadResource.description')}
        button={{
          label: t('error.failedToLoadResource.button'),
          onClick: () => document.location.reload(),
        }}
      />
    );

  return (
    <Box>
      <Helmet>
        <title>{t('menu.edit.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../' },
          { label: t('menu.edit.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
        {t('menu.edit.title')}
      </Typography>
      <Divider />
      <MenuForm
        name={name}
        setName={setName}
        nameError={nameError}
        setNameError={setNameError}
        meta={meta}
        setMeta={setMeta}
        onBack={onBackClickHandler}
        onSubmit={onSubmit}
        action="edit"
      />
    </Box>
  );
};
