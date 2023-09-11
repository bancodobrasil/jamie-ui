import { useMutation, useQuery } from '@apollo/client';
import { Box, Typography, Tab, IconButton, Button } from '@mui/material';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { FormBasicInfo } from '../../../components/Menu/Forms/BasicInfo';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { EnumInputAction, FormAction, IMenuMetaWithErrors } from '../../../types';
import { FormAttributes } from '../../../components/Menu/Forms/Attributes/FormAttributes';
import { ItemsPreview } from '../Items';
import { EditTemplateMenu } from '../EditTemplate';
import PageTitle from '../../../components/PageTitle';

export const TAB_BASIC_INFO = '1';
export const TAB_ITEMS = '2';
export const TAB_ATTRIBUTES = '3';
export const TAB_TEMPLATE = '4';

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

  const [uuid, setUUID] = React.useState<string>('');

  const [nameError, setNameError] = React.useState<string>('');

  const [mustDeferChanges, setMustDeferChanges] = React.useState<boolean>(false);

  const [hasConditions, setHasConditions] = React.useState<boolean>(false);

  const [parameters, setParameters] = React.useState<string>();

  const [metaWithErrors, setMetaWithErrors] = React.useState<IMenuMetaWithErrors[]>([]);

  const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  const [tab, setTab] = React.useState<string>(TAB_ITEMS);

  const [removeMenu, { loading: loadingDelete }] = useMutation(MenuService.REMOVE_MENU);

  useEffect(() => {
    if (loaded || !data) return;
    setUUID(data.menu.uuid);
    setName(data.menu.name);
    setMustDeferChanges(data.menu.mustDeferChanges);
    setHasConditions(data.menu.hasConditions);
    setParameters(data.menu.parameters);
    setMetaWithErrors(
      (data?.menu.meta || [])
        .map(m => {
          const { __typename, ...rest } = m;
          if (!rest.defaultValue) rest.defaultValue = '';
          return { ...rest, errors: {} };
        })
        .sort((a, b) => a.order - b.order),
    );
    setLoaded(true);
  }, [loaded, data]);

  const onTabChange = (event: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
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
    navigate('../pendencies');
  };

  const onRestoreRevisionClickHandler = () => {
    navigate('../restoreVersion');
  };

  const onCreateRevisionClickHandler = () => {
    navigate('../closeVersion');
  };

  const onPublishRevisionClickHandler = () => {
    navigate('../publishVersion');
  };

  const onBackClickHandler = () => {
    navigate('/');
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
        navigate(`/menus/${data.updateMenu.id}/edit`, { state: { refetch: true } });
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
    <Box data-testid="menu-edit" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>{t('menu.edit.title')}</title>
      </Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto' }}>
        <AppBreadcrumbs
          items={[
            { label: t('menu.title', { count: 2 }), navigateTo: '/' },
            { label: data?.menu.name },
          ]}
          onBack={onBackClickHandler}
        />
        <Box className="flex flex-row space-x-1 items-center my-4">
          <PageTitle onClick={onBackClickHandler} PageTitle={t('menu.edit.title')} />
          <Box
            className="space-x-4"
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
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
      <Box sx={{ width: '100%' }}>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={onTabChange} aria-label="Menu tabs">
              <Tab
                data-testid="tab-basic-info"
                label={t('menu.edit.tabs.basicInfo')}
                value={TAB_BASIC_INFO}
              />
              <Tab data-testid="tab-items" label={t('menu.edit.tabs.items')} value={TAB_ITEMS} />
              <Tab
                data-testid="tab-attributes"
                label={t('menu.edit.tabs.attributes')}
                value={TAB_ATTRIBUTES}
              />
              <Tab
                data-testid="tab-template"
                label={t('menu.edit.tabs.template')}
                value={TAB_TEMPLATE}
              />
            </TabList>
          </Box>
          <TabPanel value={TAB_BASIC_INFO} sx={{ p: '0px' }}>
            <FormBasicInfo
              uuid={uuid}
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
              action={FormAction.UPDATE}
            />
          </TabPanel>
          <TabPanel value={TAB_ITEMS} sx={{ p: '0px' }}>
            <ItemsPreview />
          </TabPanel>
          <TabPanel value={TAB_ATTRIBUTES} sx={{ p: '0px' }}>
            <FormAttributes
              meta={metaWithErrors}
              setMeta={setMetaWithErrors}
              loadingSubmit={loadingSubmit}
              onSubmit={onSubmit}
              onBack={onBackClickHandler}
              action={FormAction.UPDATE}
            />
          </TabPanel>
          <TabPanel value={TAB_TEMPLATE} sx={{ p: '0px' }}>
            <EditTemplateMenu />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
};
