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
import { IMenuMetaWithErrors } from '../../../types';

export const EditMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const { dispatch } = React.useContext(NotificationContext);

  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string>('');

  const [metaWithErrors, setMetaWithErrors] = React.useState<IMenuMetaWithErrors[]>([]);

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  useEffect(() => {
    if (!data) return;
    setName(data.menu.name);
    setMetaWithErrors(data?.menu.meta.map(m => ({ ...m, errors: {} })));
  }, [data]);

  const onBackClickHandler = () => {
    navigate('../');
  };

  const onSubmit = () => {
    const meta = metaWithErrors.map(m => {
      const { errors, ...rest } = m;
      rest.defaultValue === '' && delete rest.defaultValue;
      return rest;
    });
    updateMenu({
      variables: { menu: { id: Number(id), name, meta } },
      onCompleted: data => {
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
        openDefaultErrorNotification(error, dispatch);
      },
    });
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
        meta={metaWithErrors}
        setMeta={setMetaWithErrors}
        onBack={onBackClickHandler}
        onSubmit={onSubmit}
        action="edit"
      />
    </Box>
  );
};
