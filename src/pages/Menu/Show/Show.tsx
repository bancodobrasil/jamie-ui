import { Box, Button, Divider, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import ErrorBoundary, { ErrorFallbackWithBreadcrumbs } from '../../../components/ErrorBoundary';
import Loading from '../../../components/Loading';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { IMenu } from '../../../types';
import { WrapPromise } from '../../../utils/suspense/WrapPromise';

interface Props {
  id: string;
  resource: WrapPromise<IMenu>;
  onBackClickHandler: () => void;
  t: TFunction;
  navigate: NavigateFunction;
}

const PageWrapper = ({ id, resource, onBackClickHandler, t, navigate }: Props) => {
  const menu = resource.read();

  const { dispatch } = React.useContext(NotificationContext);

  const [loadingDelete, setLoadingDelete] = React.useState<boolean>(false);

  const onEditClickHandler = () => {
    navigate('edit');
  };

  const onEditItemsClickHandler = () => {
    navigate('items');
  };

  const onDeleteClickHandler = async () => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    const confirmed = confirm(t('menu.show.messages.confirmDelete'));
    if (confirmed) {
      try {
        setLoadingDelete(true);
        await MenuService.deleteMenu({ id: Number(id) });
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.deleteSuccess', {
            resource: t('menu.title', { count: 1 }),
            context: 'male',
          })}!`,
        });
        navigate('/');
      } catch (error) {
        openDefaultErrorNotification(error, dispatch);
      } finally {
        setLoadingDelete(false);
      }
    }
  };

  return (
    <Box>
      <AppBreadcrumbs
        items={[{ label: t('menu.title', { count: 2 }), navigateTo: '/' }, { label: menu.name }]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
        {menu.name}
      </Typography>
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

export const ShowMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const resource = MenuService.getMenu({ id: Number(id) });

  const onBackClickHandler = () => {
    navigate('/');
  };

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallbackWithBreadcrumbs
          message={t('common.error.service.get', { resource: t('menu.title', { count: 1 }) })}
          appBreadcrumbsProps={{
            items: [
              { label: t('application.title'), navigateTo: '/' },
              { label: t('menu.title', { count: 1 }) },
            ],
            onBack: onBackClickHandler,
          }}
        />
      }
    >
      <Suspense fallback={<Loading />}>
        <PageWrapper
          id={id}
          resource={resource}
          onBackClickHandler={onBackClickHandler}
          t={t}
          navigate={navigate}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
