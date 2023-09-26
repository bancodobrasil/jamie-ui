import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, Divider, Snackbar, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

  // const [isCopied, setIsCopied] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const handleCopyClick = () => {
    setIsCopied(true);
    setIsSnackbarOpen(true);
  };
  const handleSnackbarClose = reason => {
    if (reason) {
      return;
    }
    setIsSnackbarOpen(false);
  };

  // const onBackButtonHandler = () => {
  //   navigate('../edit');
  // };
  const [isCopied, setIsCopied] = useState(false);
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

  // const onEditTemplateClickHandler = () => {
  //   navigate('editTemplate');
  // };

  // const onEditItemsClickHandler = () => {
  //   navigate('items');
  // };

  // const onDeleteClickHandler = () => {
  //   // eslint-disable-next-line no-restricted-globals, no-alert
  //   const confirmed = confirm(t('menu.show.messages.confirmDelete'));
  //   if (confirmed) {
  //     removeMenu({
  //       variables: { id: Number(id) },
  //       onCompleted: data => {
  //         dispatch({
  //           type: ActionTypes.OPEN_NOTIFICATION,
  //           message: `${t('notification.deleteSuccess', {
  //             resource: t('menu.title', { count: 1 }),
  //             context: 'male',
  //           })}!`,
  //         });
  //         navigate('/');
  //       },
  //       onError: error => {
  //         openDefaultErrorNotification(error, dispatch);
  //       },
  //     });
  //   }
  // };

  // const onPendenciesClickHandler = () => {
  //   navigate('pendencies');
  // };

  // const onRestoreRevisionClickHandler = () => {
  //   navigate('restoreVersion');
  // };

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
    <Box>
      <Helmet>
        <title>{data?.menu.name}</title>
      </Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto' }}>
        <AppBreadcrumbs
          items={[
            { label: t('menu.title', { count: 2 }), navigateTo: '/' },
            { label: data?.menu.name },
          ]}
          onBack={onBackClickHandler}
        />
        <Box className="flex flex-row space-x-1 items-center">
          <PageTitle onClick={onBackClickHandler} PageTitle={t('menu.edit.title')} />
          <Box
            className="space-x-4"
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {/* action buttons */}
            <Button
              sx={{ borderColor: '#056571' }}
              variant="outlined"
              onClick={onCreateRevisionClickHandler}
              disabled={loadingDelete}
            >
              {t('menu.show.actions.createRevision')}
            </Button>
            <Button
              sx={{ borderColor: '#056571' }}
              variant="outlined"
              onClick={onPublishRevisionClickHandler}
              disabled={loadingDelete}
            >
              {t('menu.show.actions.publishRevision')}
            </Button>
            <Button variant="contained" onClick={onEditClickHandler} disabled={loadingDelete}>
              {t('menu.show.actions.edit')}
            </Button>
          </Box>
        </Box>
      </Box>
      {/* details about menu */}
      <Box className="flex flex-row space-x-1  my-4" sx={{ justifyContent: 'flex-start' }}>
        {/* last version */}
        <Box sx={{ marginRight: '4rem', color: '#6C7077' }}>
          {t('menu.fields.publishedRevision')}
          <Box>
            <Typography variant="body1" component="p" sx={{ color: '#111214', width: '7.2rem' }}>
              <b>{data?.menu.publishedRevision?.id || '-'}</b>
            </Typography>
          </Box>
        </Box>
        {/* UUID */}
        <Box sx={{ paddingRight: '4rem', color: '#6C7077', height: '2.4rem', width: '23.3rem' }}>
          <ContentCopyIcon sx={{ color: '#022831' }} onClick={handleCopyClick} />
          {t('menu.fields.menu_uuid')}
          <Box
            sx={{
              color: '#111214',
              fontWeight: '500',
              paddingLeft: '1.5rem',
            }}
          >
            <b>{data.menu.uuid}</b>
          </Box>
        </Box>
        <Snackbar open={isSnackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert elevation={6} variant="filled" severity="success" onClose={handleSnackbarClose}>
            Pronto! O UUID do menu foi copiado.
          </Alert>
        </Snackbar>
        <Box sx={{ color: '#6C7077', height: '2.4rem', width: '9.5rem' }}>
          {t('menu.fields.mustDeferChanges')}
          <Box sx={{ color: '#111214' }}>
            <b>{data?.menu.mustDeferChanges ? t('common.yes') : t('common.no')}</b>
          </Box>
        </Box>
      </Box>
      <Divider />

      {/*       
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
      </Box> */}
    </Box>
  );
};
