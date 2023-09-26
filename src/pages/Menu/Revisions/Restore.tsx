import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  SelectChangeEvent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { MenuRevisionsDiff } from '../../../components/Menu/Revisions';
import MenuRevisionService from '../../../api/services/MenuRevisionService';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { menuRevisionDiff } from '../../../utils/diff/menuRevisionDiff';
import PageTitle from '../../../components/PageTitle';

const RestoreRevision = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const onBackButtonHandler = () => {
    navigate('../edit');
  };

  const { dispatch } = React.useContext(NotificationContext);

  const [selectedRevision, setSelectedRevision] = React.useState(null);

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const { loading, error, data } = useQuery(MenuService.GET_MENU_REVISIONS, {
    variables: { id: Number(id) },
  });

  const [restoreRevision] = useMutation(MenuRevisionService.RESTORE_REVISION);

  const getChildren = React.useCallback((items: any[], parent: any): any[] => {
    const children = items
      .filter(item => item.parentId === parent.id)
      .map(item => ({
        ...item,
        children: getChildren(items, item),
      }));
    return children;
  }, []);

  const menu = React.useMemo(() => {
    if (!data?.menu) return null;
    const { name, meta, items, template, templateFormat } = data.menu;
    const removeTypename = (arr: any[]) =>
      arr.map(item => {
        const { __typename, ...rest } = item;
        return rest;
      });
    const currentMeta = meta && removeTypename(meta);
    let currentItems = items && removeTypename(items);
    currentItems = currentItems
      .map(item => ({
        ...item,
        children: getChildren(currentItems || [], item),
      }))
      .filter(item => !item.parentId);
    return { name, meta: currentMeta, items: currentItems, template, templateFormat };
  }, [data?.menu, getChildren]);

  const menuDiff: any = React.useMemo(() => {
    if (!menu || !selectedRevision) return null;
    const snapshot = { ...selectedRevision.snapshot };
    snapshot.items = snapshot.items
      ?.map(item => ({
        ...item,
        children: getChildren(snapshot.items || [], item),
      }))
      .filter(item => !item.parentId);
    const updatedMeta = (menu.meta || []).map((item: any, index: number) => {
      const current = snapshot.meta?.[index];
      if (!current || item.id !== current.id || item.type !== current.type) {
        const updatedItem = snapshot.meta?.find(i => i.id === item.id && i.type === item.type);
        if (updatedItem) return updatedItem;
        return null;
      }
      return current;
    });
    snapshot.meta = [...(updatedMeta || []), ...(snapshot.meta || [])].filter(
      (item, index, arr) => {
        if (item === null) return true;
        return arr.findIndex(i => i?.id === item.id) === index;
      },
    );
    const setUpdatedItems = (snapshotItems: any[], currentItems: any[]) =>
      currentItems?.map((item: any, index: number) => {
        const current = snapshotItems?.[index];
        if (!current || item.id !== current.id) {
          const updatedItem = snapshotItems?.find(i => i.id === item.id);
          if (updatedItem)
            return {
              ...updatedItem,
              children: setUpdatedItems(updatedItem.children, item.children),
            };
          return null;
        }
        return { ...current, children: setUpdatedItems(current.children, item.children) };
      });
    const updatedItems = setUpdatedItems(snapshot.items, menu.items);

    if (selectedRevision.createdAt > data.menu.currentRevision.createdAt) {
      snapshot.items = [...(snapshot.items || []), ...(updatedItems || [])];
    } else {
      snapshot.items = [...(updatedItems || []), ...(snapshot.items || [])];
    }

    snapshot.items = snapshot.items.filter((item, index, arr) => {
      if (item === null) return true;
      return arr.findIndex(i => i?.id === item.id) === index;
    });
    const diff = menuRevisionDiff(menu, snapshot);
    return diff;
  }, [menu, selectedRevision, getChildren, data]);

  const renderMenuRevisions = () => {
    if (!data?.menu.revisions?.length) return null;
    return data.menu.revisions.map((revision: any) => (
      <MenuItem key={revision.id} value={revision.id}>
        {revision.id} - {revision.description}
      </MenuItem>
    ));
  };

  const onSubmitClickHandler = async () => {
    setLoadingSubmit(true);
    restoreRevision({
      variables: {
        menuId: Number(id),
        revisionId: selectedRevision.id,
      },
      onCompleted: data => {
        setLoadingSubmit(false);
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('menuRevision.restore.notification.success')}!`,
        });
        navigate(`/menus/${id}/edit`);
      },
      onError: error => {
        setLoadingSubmit(false);
        openDefaultErrorNotification(error, dispatch);
      },
    });
  };

  const renderDiff = () => {
    if (!selectedRevision)
      return (
        <Typography variant="h6" component="h6">
          {t('menuRevision.restore.selectRevision')}
        </Typography>
      );
    if (!menuDiff || !Object.keys(menuDiff).length)
      return (
        <Box className="flex flex-col py-4">
          <Typography variant="h6" component="h6">
            <i className="text-gray-400">{t('menuRevision.restore.noChanges')}</i>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/menus/${id}`)}
            sx={{
              width: 'fit-content',
              mt: '1rem',
            }}
          >
            {t('buttons.back')}
          </Button>
        </Box>
      );
    return (
      <>
        <Typography variant="h2" component="h2" sx={{ my: '0.5rem' }}>
          {t('menuRevision.restore.reviewChanges.title')}
        </Typography>
        <Typography variant="body1" component="p" sx={{ my: '0.5rem' }}>
          {t('menuRevision.restore.reviewChanges.description')}
        </Typography>
        <MenuRevisionsDiff id={id} diff={menuDiff} snapshot={menu} />
        <Divider />
        <Box className="py-4">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loadingSubmit}
            onClick={onSubmitClickHandler}
            sx={{
              width: 'fit-content',
            }}
          >
            {t('menuRevision.restore.title')}
          </Button>
        </Box>
      </>
    );
  };

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 1,
            field: t('menuRevision.title', { count: 2 }),
          }).toLowerCase(),
        })}
        description={t('error.failedToLoadResource.description')}
        button={{
          label: t('error.failedToLoadResource.button'),
          onClick: () => document.location.reload(),
        }}
      />
    );

  if (loading) return <Loading />;

  return (
    <Box sx={{ paddingLeft: '2rem' }}>
      <Helmet>
        <title>{t('menuRevision.restore.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../edit' },
          { label: t('menuRevision.restore.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <PageTitle onClick={onBackButtonHandler} PageTitle={t('menuRevision.restore.title')} />
      <FormControl sx={{ width: '16rem', mb: '1rem' }} className="bg-white">
        <InputLabel id="selectedRevision-label">
          {t('menu.of', { field: 'revision.title_one' })}
        </InputLabel>
        <Select
          labelId="selectedRevision-label"
          id="selectedRevision"
          value={selectedRevision?.id || ''}
          label={t('menu.of', { field: 'revision.title_one' })}
          onChange={(e: SelectChangeEvent) => {
            const { value } = e.target;
            const revision = data.menu.revisions.find(r => r.id === value);
            setSelectedRevision(revision);
          }}
        >
          {renderMenuRevisions()}
        </Select>
      </FormControl>
      {renderDiff()}
    </Box>
  );
};

export default RestoreRevision;
