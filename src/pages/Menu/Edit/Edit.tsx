import { Box, Divider, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import ErrorBoundary, { ErrorFallbackWithBreadcrumbs } from '../../../components/ErrorBoundary';
import Loading from '../../../components/Loading';
import { MenuForm } from '../../../components/Menu/Form';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { IMenu, IMenuMetaWithErrors } from '../../../types';
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

  const [name, setName] = React.useState<string>(menu.name);
  const [nameError, setNameError] = React.useState<string>('');

  const [meta, setMeta] = React.useState<IMenuMetaWithErrors[]>(() =>
    menu.meta.map(m => ({ ...m, errors: {} })),
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

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: menu.name, navigateTo: '../' },
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

export const EditMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const resource = MenuService.getMenu({ id: Number(id) });

  const onBackClickHandler = () => {
    navigate('../');
  };

  return (
    <>
      <Helmet>
        <title>{t('menu.edit.title')}</title>
      </Helmet>
      <ErrorBoundary
        fallback={
          <ErrorFallbackWithBreadcrumbs
            message={t('common.error.service.get', { resource: t('menu.title', { count: 1 }) })}
            appBreadcrumbsProps={{
              items: [{ label: t('menu.title'), navigateTo: '/' }, { label: t('menu.edit.title') }],
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
    </>
  );
};
