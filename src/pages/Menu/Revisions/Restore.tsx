import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  SelectChangeEvent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { deepDiff } from '../../../utils/deepDiff';
import { MenuRevisionsDiff } from '../../../components/Menu/Revisions';

const RestoreRevision = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const [selectedRevision, setSelectedRevision] = React.useState(null);

  const { loading, error, data } = useQuery(MenuService.GET_MENU_REVISIONS, {
    variables: { id: Number(id) },
  });

  const getChildren = React.useCallback((items: any[], parent: any): any[] => {
    const children = items
      .filter(item => item.parentId === parent.id)
      .map(item => ({
        ...item,
        children: getChildren(items, item),
      }))
      .sort((a, b) => a.order - b.order);
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
      .filter(item => !item.parentId)
      .sort((a, b) => a.order - b.order);
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
      .filter(item => !item.parentId)
      .sort((a, b) => a.order - b.order);
    const updatedMeta = menu.meta?.map((item: any, index: number) => {
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
    snapshot.items = [...(snapshot.items || []), ...(updatedItems || [])].filter(
      (item, index, arr) => {
        if (item === null) return true;
        return arr.findIndex(i => i?.id === item.id) === index;
      },
    );
    const diff = Object.entries(deepDiff(menu, snapshot))
      .filter(([key, value]) => {
        if (value.to === undefined || (value.from === undefined && value.to === null)) return false;
        return true;
      })
      .reduce((acc, [key, value]) => {
        const split = key.split('.');
        split.reduce((acc, key, index) => {
          if (index === split.length - 1) {
            acc[key] = value.to;
          } else if (!acc[key]) acc[key] = {};
          return acc[key];
        }, acc);
        return acc;
      }, {});
    return diff;
  }, [menu, selectedRevision, getChildren]);

  const renderMenuRevisions = () => {
    if (!data?.menu.revisions?.length) return null;
    return data.menu.revisions.map((revision: any) => (
      <MenuItem key={revision.id} value={revision.id}>
        {revision.id} - {revision.description}
      </MenuItem>
    ));
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
    <Box>
      <Helmet>
        <title>{t('menuRevision.restore.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../' },
          { label: t('menuRevision.restore.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
        {t('menuRevision.restore.title')}
      </Typography>
      <FormControl sx={{ width: '16rem', mb: '1rem' }} className="bg-white" required>
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
      {menuDiff && Object.keys(menuDiff).length ? (
        <>
          <Typography variant="h2" component="h2" sx={{ my: '0.5rem' }}>
            {t('menuRevision.restore.reviewChanges.title')}
          </Typography>
          <Typography variant="body1" component="p" sx={{ my: '0.5rem' }}>
            {t('menuRevision.restore.reviewChanges.description')}
          </Typography>
          <MenuRevisionsDiff id={id} diff={menuDiff} snapshot={menu} />
        </>
      ) : null}
    </Box>
  );
};

export default RestoreRevision;
