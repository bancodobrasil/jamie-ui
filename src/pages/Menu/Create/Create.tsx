import { useMutation } from '@apollo/client';
import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import { FormBasicInfo } from '../../../components/Menu/Forms/BasicInfo';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { FormAction } from '../../../types';
import BackButton from '../../../components/BackButton';

export const CreateMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { dispatch } = React.useContext(NotificationContext);

  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string>('');

  const [mustDeferChanges, setMustDeferChanges] = React.useState<boolean>(false);

  const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);

  const [hasConditions, setHasConditions] = React.useState<boolean>(false);

  const [parameters, setParameters] = React.useState<string>();

  const [createMenu] = useMutation(MenuService.CREATE_MENU);

  const onBackClickHandler = () => {
    navigate('/');
  };

  const onSubmit = () => {
    setLoadingSubmit(true);
    createMenu({
      variables: { menu: { name, mustDeferChanges, hasConditions, parameters } },
      onCompleted: data => {
        setLoadingSubmit(false);
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.createSuccess', {
            resource: t('menu.title', { count: 1 }),
            context: 'male',
          })}!`,
        });
        navigate(`/menus/${data.createMenu.id}/edit`);
      },
      onError: error => {
        setLoadingSubmit(false);
        openDefaultErrorNotification(error, dispatch);
      },
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>{t('menu.create.title')}</title>
      </Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto' }}>
        <AppBreadcrumbs
          items={[
            { label: t('menu.title', { count: 2 }), navigateTo: '/' },
            { label: t('menu.create.title') },
          ]}
          onBack={onBackClickHandler}
        />
        <BackButton onClick={onBackClickHandler} />
        <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
          {t('menu.create.title')}
        </Typography>
        <Divider />
      </Box>
      <FormBasicInfo
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
        loadingSubmit={loadingSubmit}
        onSubmit={onSubmit}
        onBack={onBackClickHandler}
        action={FormAction.CREATE}
      />
    </Box>
  );
};
