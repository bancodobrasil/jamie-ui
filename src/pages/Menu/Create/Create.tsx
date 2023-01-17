import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import { MenuForm } from '../../../components/Menu/Form';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { IMenuMetaWithErrors } from '../../../types';

export const CreateMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { dispatch } = React.useContext(NotificationContext);

  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string>('');

  const [meta, setMeta] = React.useState<IMenuMetaWithErrors[]>([]);

  const onBackClickHandler = () => {
    navigate('/');
  };

  const onSubmit = async () => {
    // TODO: Implement the API request.
    // The Promise below simulates the loading time of the request, remove it when you implement the request itself.
    try {
      await MenuService.createMenu({ name, meta });
      dispatch({
        type: ActionTypes.OPEN_NOTIFICATION,
        message: `${t('notification.createSuccess', {
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
      <Helmet>
        <title>{t('menu.create.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: t('menu.create.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
        {t('menu.create.title')}
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
        action="create"
      />
    </Box>
  );
};
