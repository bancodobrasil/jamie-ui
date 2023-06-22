import { useMutation, useQuery } from '@apollo/client';
import { Box, Divider, Typography } from '@mui/material';
import React, { useEffect } from 'react';
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
import { EnumInputAction, FormAction, IMenuMetaWithErrors } from '../../../types';

export const EditMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const { dispatch } = React.useContext(NotificationContext);

  const [loaded, setLoaded] = React.useState<boolean>(false);

  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string>('');

  const [mustDeferChanges, setMustDeferChanges] = React.useState<boolean>(false);

  const [hasConditions, setHasConditions] = React.useState<boolean>(false);

  const [parameters, setParameters] = React.useState<string>();

  const [metaWithErrors, setMetaWithErrors] = React.useState<IMenuMetaWithErrors[]>([]);

  const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  useEffect(() => {
    if (loaded || !data) return;
    setName(data.menu.name);
    setMustDeferChanges(data.menu.mustDeferChanges);
    setHasConditions(data.menu.hasConditions);
    setParameters(data.menu.parameters);
    setMetaWithErrors(
      data?.menu.meta
        .map(m => {
          const { __typename, ...rest } = m;
          if (!rest.defaultValue) rest.defaultValue = '';
          return { ...rest, errors: {} };
        })
        .sort((a, b) => a.order - b.order),
    );
    setLoaded(true);
  }, [loaded, data]);

  const onBackClickHandler = () => {
    navigate('../');
  };

  const onSubmit = () => {
    setLoadingSubmit(true);
    const meta = metaWithErrors
      .filter(m => !!m.action)
      .map(m => {
        const { errors, ...rest } = m;
        if (rest.defaultValue === '') {
          rest.defaultValue = null;
        }
        if (rest.action === EnumInputAction.UPDATE) {
          Object.entries(rest).forEach(([key, value]) => {
            if (key === 'id') return;
            const previousValue = data.menu.meta.find(m => m.id === rest.id)[key];
            if (value === previousValue) {
              delete rest[key];
            }
          });
        }
        return rest;
      });
    const updatedName = name !== data.menu.name ? name : undefined;
    updateMenu({
      variables: {
        menu: { id: Number(id), name: updatedName, mustDeferChanges, meta, parameters },
      },
      onCompleted: data => {
        setLoadingSubmit(false);
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.editSuccess', {
            resource: t('menu.title', { count: 1 }),
            context: 'male',
          })}!`,
        });
        navigate(`/menus/${data.updateMenu.id}`, { state: { refetch: true } });
      },
      onError: error => {
        setLoadingSubmit(false);
        openDefaultErrorNotification(error, dispatch);
      },
    });
  };

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

  if (loading || !loaded) return <Loading />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>{t('menu.edit.title')}</title>
      </Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto' }}>
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
      </Box>
      <MenuForm
        name={name}
        setName={setName}
        nameError={nameError}
        setNameError={setNameError}
        mustDeferChanges={mustDeferChanges}
        setMustDeferChanges={setMustDeferChanges}
        hasConditions={hasConditions}
        setHasConditions={setHasConditions}
        parameters={parameters}
        setParameters={setParameters}
        meta={metaWithErrors}
        setMeta={setMetaWithErrors}
        loadingSubmit={loadingSubmit}
        onSubmit={onSubmit}
        onBack={onBackClickHandler}
        action={FormAction.UPDATE}
      />
    </Box>
  );
};
