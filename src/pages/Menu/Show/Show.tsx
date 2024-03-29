import { useMutation, useQuery } from '@apollo/client';
import { Box, Button, Divider, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { JAMIE_FEATURE_CONDITIONS } from '../../../constants';
import PageTitle from '../../../components/PageTitle';

export const ShowMenu = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const { state: locationState } = useLocation();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const onBackButtonHandler = () => {
    navigate('../edit');
  };

  const { dispatch } = React.useContext(NotificationContext);

  const { loading, error, data, refetch } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const [removeMenu, { loading: loadingDelete }] = useMutation(MenuService.REMOVE_MENU);

  useEffect(() => {
    if (locationState?.refetch) {
      refetch();
    }
  }, [locationState, refetch]);

  const onEditClickHandler = () => {
    navigate('edit');
  };

  const onEditTemplateClickHandler = () => {
    navigate('editTemplate');
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

  const onPendenciesClickHandler = () => {
    navigate('pendencies');
  };

  const onRestoreRevisionClickHandler = () => {
    navigate('restoreVersion');
  };

  const onCreateRevisionClickHandler = () => {
    navigate('closeVersion');
  };

  const onPublishRevisionClickHandler = () => {
    navigate('publishVersion');
  };

  const renderMeta = () => {
    if (!data?.menu.meta) return null;
    const meta = [...data.menu.meta];
    return meta
      .sort((a, b) => a.order - b.order)
      .map(meta => (
        <Box
          key={meta.id}
          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          className="space-y-1"
        >
          <Typography variant="h4" component="h4" className={!meta.enabled ? 'line-through' : ''}>
            {meta.order}. {meta.name}
          </Typography>
          <Typography variant="body1" component="p">
            {t('menu.fields.meta.type.title', { count: 1 })}:{' '}
            <b>{t(`menu.fields.meta.type.${meta.type}`)}</b>
          </Typography>
          <Typography variant="body1" component="p">
            {t('common.required')}? <b>{meta.required ? t('common.yes') : t('common.no')}</b>
          </Typography>
          <Typography variant="body1" component="p">
            {t('menu.fields.meta.enabled')}?{' '}
            <b>{meta.enabled ? t('common.yes') : t('common.no')}</b>
          </Typography>
          {meta.defaultValue && (
            <Typography variant="body1" component="p">
              {t('menu.fields.meta.defaultValue')}: <b>{meta.defaultValue}</b>
            </Typography>
          )}
        </Box>
      ));
  };

  const renderHasConditions = () => {
    if (!JAMIE_FEATURE_CONDITIONS) return null;
    return (
      <Box className="space-x-1.5 flex flex-row items-center">
        <Typography variant="h5" component="h5" className="mb-2">
          {t('menu.fields.hasConditions')}?
        </Typography>
        <Typography variant="body1" component="p">
          <b>{data?.menu.hasConditions ? t('common.yes') : t('common.no')}</b>
        </Typography>
      </Box>
    );
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
    <Box sx={{ paddingLeft: '2rem' }}>
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
      <Box className="flex flex-row space-x-1 items-center my-4">
        <PageTitle onClick={onBackButtonHandler} PageTitle={data?.menu.name} />
        <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
          {data?.menu.name}
        </Typography>
      </Box>
      <Box sx={{ mb: '1rem' }} className="space-y-4">
        <Box className="space-y-1">
          <Typography variant="h5" component="h5" className="mb-2">
            {t('common.fields.createdAt')}:
          </Typography>
          <Typography variant="body1" component="p">
            <b>
              {DateTime.fromISO(data?.menu.createdAt)
                .setLocale(i18n.language)
                .toLocaleString(DateTime.DATETIME_FULL)}
            </b>
          </Typography>
        </Box>
        <Box className="space-y-1">
          <Typography variant="h5" component="h5" className="mb-2">
            {t('common.fields.updatedAt')}:
          </Typography>
          <Typography variant="body1" component="p">
            <b>
              {DateTime.fromISO(data?.menu.updatedAt)
                .setLocale(i18n.language)
                .toLocaleString(DateTime.DATETIME_FULL)}
            </b>
          </Typography>
        </Box>
        <Box className="space-y-1">
          <Typography variant="h5" component="h5" className="mb-2">
            {t('menu.fields.currentRevision')}:
          </Typography>
          <Typography variant="body1" component="p">
            {t('common.fields.id')}: <b>{data?.menu.currentRevision?.id || '-'}</b>
          </Typography>
          <Typography variant="body1" component="p">
            {t('menu.fields.revision.description')}:{' '}
            <b>{data?.menu.currentRevision?.description || '-'}</b>
          </Typography>
        </Box>
        <Box className="space-y-1">
          <Typography variant="h5" component="h5" className="mb-2">
            {t('menu.fields.publishedRevision')}:
          </Typography>
          <Typography variant="body1" component="p">
            {t('common.fields.id')}: <b>{data?.menu.publishedRevision?.id || '-'}</b>
          </Typography>
          <Typography variant="body1" component="p">
            {t('menu.fields.revision.description')}:{' '}
            <b>{data?.menu.publishedRevision?.description || '-'}</b>
          </Typography>
        </Box>
        <Box className="space-x-1.5 flex flex-row items-center">
          <Typography variant="h5" component="h5" className="mb-2">
            {t('menu.fields.mustDeferChanges')}?
          </Typography>
          <Typography variant="body1" component="p">
            <b>{data?.menu.mustDeferChanges ? t('common.yes') : t('common.no')}</b>
          </Typography>
        </Box>
        {renderHasConditions()}
      </Box>
      <Divider />
      {/* <Typography variant="h3" component="h3" sx={{ py: '1rem' }}>
        {t('menu.fields.meta.title', { count: 2 })}
      </Typography>
      <Box sx={{ mb: '1rem' }} className="space-y-4">
        {data?.menu.meta && data?.menu.meta.length > 0 ? (
          renderMeta()
        ) : (
          <p className="text-gray-500">{t('common.noData')}</p>
        )}
      </Box>
      <Divider /> */}
      <Box className="flex flex-col space-y-4 py-4 w-fit">
        <Typography variant="h2" component="h2">
          {t('menu.show.actions.title')}:
        </Typography>
        <Box className="flex space-x-8">
          <Button variant="contained" onClick={onEditClickHandler} disabled={loadingDelete}>
            {t('menu.show.actions.edit')}
          </Button>
          {/* <Button variant="outlined" onClick={onEditTemplateClickHandler} disabled={loadingDelete}>
            {t('menu.show.actions.editTemplate')}
          </Button> */}
          {/* <Button variant="outlined" onClick={onEditItemsClickHandler} disabled={loadingDelete}>
            {t('menu.show.actions.editItems')}
          </Button> */}
          <Button
            variant="outlined"
            color="error"
            onClick={onDeleteClickHandler}
            disabled={loadingDelete}
          >
            {t('menu.show.actions.delete')}
          </Button>
          {data?.menu.mustDeferChanges && (
            <Button
              variant="outlined"
              color="warning"
              onClick={onPendenciesClickHandler}
              disabled={loadingDelete}
            >
              {t('menu.show.actions.pendencies')}
            </Button>
          )}
          {/* </Box>
        <Divider />
        <Box className="flex justify-center space-x-8"> */}
          <Button
            variant="outlined"
            color="warning"
            onClick={onRestoreRevisionClickHandler}
            disabled={loadingDelete}
          >
            {t('menu.show.actions.restoreRevision')}
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={onCreateRevisionClickHandler}
            disabled={loadingDelete}
          >
            {t('menu.show.actions.createRevision')}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onPublishRevisionClickHandler}
            disabled={loadingDelete}
          >
            {t('menu.show.actions.publishRevision')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
