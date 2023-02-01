import { useMutation, useQuery } from '@apollo/client';
import { Box, Button, Divider, Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';

export const ShowMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const { dispatch } = React.useContext(NotificationContext);

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const [removeMenu, { loading: loadingDelete }] = useMutation(MenuService.REMOVE_MENU);

  const onEditClickHandler = () => {
    navigate('edit');
  };

  const onEditItemsClickHandler = () => {
    navigate('items');
  };

  const onDeleteClickHandler = () => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    const confirmed = confirm(t('menu.show.messages.confirmDelete'));
    if (confirmed) {
      removeMenu({
        variables: { id: Number(id) },
        onCompleted: data => {
          dispatch({
            type: ActionTypes.OPEN_NOTIFICATION,
            message: `${t('notification.deleteSuccess', {
              resource: t('menu.title', { count: 1 }),
              context: 'male',
            })}!`,
          });
          navigate('/');
        },
        onError: error => {
          openDefaultErrorNotification(error, dispatch);
        },
      });
    }
  };

  const renderMeta = () =>
    data?.menu.meta.map((meta, i) => (
      <Box
        key={i}
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        className="space-y-1"
      >
        <Typography variant="h4" component="h4">
          {i + 1}. {meta.name}
        </Typography>
        <Typography variant="body1" component="p">
          {t('menu.fields.meta.type.title', { count: 1 })}:{' '}
          <b>{t(`menu.fields.meta.type.${meta.type}`)}</b>
        </Typography>
        <Typography variant="body1" component="p">
          {t('common.required')}? <b>{meta.required ? t('common.yes') : t('common.no')}</b>
        </Typography>
      </Box>
    ));

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
        <title>{data?.menu.name}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
        {data?.menu.name}
      </Typography>
      <Divider />
      <Typography variant="h3" component="h3" sx={{ py: '1rem' }}>
        {t('menu.fields.meta.title', { count: 2 })}
      </Typography>
      <Box sx={{ mb: '1rem' }} className="space-y-4">
        {data?.menu.meta.length > 0 ? (
          renderMeta()
        ) : (
          <p className="text-gray-500">{t('common.noData')}</p>
        )}
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', my: '1rem' }}>
        <Button
          variant="contained"
          sx={{ mr: '1rem' }}
          onClick={onEditClickHandler}
          disabled={loadingDelete}
        >
          {t('menu.show.actions.edit')}
        </Button>
        <Button
          variant="outlined"
          sx={{ mr: '1rem' }}
          onClick={onEditItemsClickHandler}
          disabled={loadingDelete}
        >
          {t('menu.show.actions.editItems')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          sx={{ mr: '1rem' }}
          onClick={onDeleteClickHandler}
          disabled={loadingDelete}
        >
          {t('menu.show.actions.delete')}
        </Button>
      </Box>
    </Box>
  );
};
