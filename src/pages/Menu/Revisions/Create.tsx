import React from 'react';
import { useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { deepDiff } from '../../../utils/deepDiff';

const CreateRevision = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const { loading, error, data } = useQuery(MenuService.GET_MENU_REVISIONS, {
    variables: { id: Number(id) },
  });

  const menuDiff: any = React.useMemo(() => {
    if (!data?.menu) return null;
    const { name, meta, items, template, templateFormat, currentRevision } = data.menu;
    const removeTypename = (arr: any[]) =>
      arr.map(item => {
        const { __typename, ...rest } = item;
        return rest;
      });
    const getChildren = (items: any[], parent: any): any[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map(item => ({
          ...item,
          children: getChildren(items, item),
        }))
        .sort((a, b) => a.order - b.order);
      return children;
    };
    let currentMeta = meta && removeTypename(meta);
    let currentItems = items && removeTypename(items);
    currentItems = currentItems
      .map(item => ({
        ...item,
        children: getChildren(currentItems || [], item),
      }))
      .filter(item => !item.parentId)
      .sort((a, b) => a.order - b.order);
    if (!currentRevision)
      return { name, meta: currentMeta, items: currentItems, template, templateFormat };
    const snapshot = { ...currentRevision.snapshot };
    snapshot.items = snapshot.items
      ?.map(item => ({
        ...item,
        children: getChildren(snapshot.items || [], item),
      }))
      .filter(item => !item.parentId)
      .sort((a, b) => a.order - b.order);
    const updatedMeta = snapshot.meta?.map((item: any, index: number) => {
      const current = currentMeta?.[index];
      if (!current || item.id !== current.id || item.type !== current.type) {
        const updatedItem = currentMeta?.find(i => i.id === item.id && i.type === item.type);
        if (updatedItem) return updatedItem;
        return null;
      }
      return current;
    });
    currentMeta = [...(updatedMeta || []), ...(currentMeta || [])].filter((item, index, arr) => {
      if (item === null) return true;
      return arr.findIndex(i => i?.id === item.id) === index;
    });
    const setUpdatedItems = (snapshotItems: any[], currentItems: any[]) =>
      snapshotItems?.map((item: any, index: number) => {
        const current = currentItems?.[index];
        if (!current || item.id !== current.id) {
          const updatedItem = currentItems?.find(i => i.id === item.id);
          if (updatedItem)
            return {
              ...updatedItem,
              children: setUpdatedItems(item.children, updatedItem.children),
            };
          return null;
        }
        return { ...current, children: setUpdatedItems(item.children, current.children) };
      });
    const updatedItems = setUpdatedItems(snapshot.items, currentItems);
    currentItems = [...(updatedItems || []), ...(currentItems || [])].filter((item, index, arr) => {
      if (item === null) return true;
      return arr.findIndex(i => i?.id === item.id) === index;
    });
    const diff = Object.entries(
      deepDiff(snapshot, {
        name,
        meta: currentMeta,
        items: currentItems,
        template,
        templateFormat,
      }),
    )
      .filter(([key, value]) => {
        if (value.to === undefined) return false;
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
  }, [data]);

  const renderChanges = (from: any, to?: any) => {
    if (to === undefined)
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    return (
      <Box className="flex">
        <Typography variant="body1" component="span">
          {t('common.from')}:{' '}
          {from ? <b>{from}</b> : <i className="text-gray-500">{t('common.none')}</i>}
        </Typography>
        <ArrowForwardIcon sx={{ mx: '0.5rem' }} />
        <Typography variant="body1" component="span">
          {t('common.to')}: <b>{to}</b>
        </Typography>
      </Box>
    );
  };

  const renderMetaChanges = (from: any, to: any) => {
    const fields = Object.keys(to);
    return fields.map(field => {
      if (field === 'id' || field === 'order') return null;
      const fieldName =
        field === 'type'
          ? t(`menu.fields.meta.${field}.title`, { count: 1 })
          : t(`menu.fields.meta.${field}`);
      let fieldValueFrom =
        field === 'type' ? t(`menu.fields.meta.${field}.${from?.[field]}`) : from?.[field];
      let fieldValueTo = field === 'type' ? t(`menu.fields.meta.${field}.${to[field]}`) : to[field];
      if (field === 'required' || field === 'enabled') {
        fieldValueFrom = fieldValueFrom ? t('common.yes') : t('common.no');
        fieldValueTo = fieldValueTo ? t('common.yes') : t('common.no');
      }
      if (!fieldValueFrom && !fieldValueTo) return null;
      if (from?.[field] === undefined || from?.[field] === null) {
        if (field === 'name') return null;
        return (
          <Typography
            variant="body1"
            component="span"
            key={field}
            sx={{ ml: '1rem', my: '0.25rem' }}
          >
            <b>{fieldName}</b>: {fieldValueTo}
          </Typography>
        );
      }
      return (
        <Box className="flex flex-col my-1 ml-4" key={field}>
          <Typography variant="body1" component="span">
            <b>{fieldName}</b>:
          </Typography>
          {renderChanges(fieldValueFrom, fieldValueTo)}
        </Box>
      );
    });
  };

  const renderMeta = () => {
    if (!menuDiff?.meta)
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    return Object.keys(menuDiff.meta).map(index => {
      const from = data.menu.currentRevision.snapshot.meta[index];
      const to = menuDiff.meta[index];
      if (to === null)
        return (
          <Box className="flex flex-col my-2" key={index}>
            <Typography variant="h5" component="h5" className="line-through">
              {from.order}. {from.name}
            </Typography>
            <Typography variant="body1" component="p" sx={{ ml: '1rem', color: 'error.main' }}>
              {t('common.deleted', { context: 'male' })}
            </Typography>
          </Box>
        );
      if (!from || (to.id && from.id !== to.id) || (to.type && from.type !== to.type))
        return (
          <Box className="flex flex-col my-2" key={index}>
            <Typography variant="h5" component="h5">
              {to.order}. {to.name}
            </Typography>
            <Typography variant="body1" component="p" sx={{ ml: '1rem', color: 'success.main' }}>
              {t('common.added', { context: 'male' })}
            </Typography>
            {renderMetaChanges(from, to)}
          </Box>
        );
      return (
        <Box className="flex flex-col my-2" key={index}>
          <Typography variant="h5" component="h5">
            {to.order || from.order}. {to.name || from.name}:
          </Typography>
          {renderMetaChanges(from, to)}
        </Box>
      );
    });
  };

  const renderItemChanges = (from: any, to: any) => {
    const fields = Object.keys(to);
    return fields.map(field => {
      if (
        field === 'id' ||
        field === 'order' ||
        field === 'meta' ||
        field === 'parentId' ||
        field === 'menuId' ||
        field === 'menu' ||
        field === 'createdAt' ||
        field === 'updatedAt' ||
        field === 'deletedAt' ||
        field === 'version'
      )
        return null;
      if (field === 'children') {
        const id = from?.id || to.id;
        return (
          <Box className="flex flex-col my-1 ml-4" key={field}>
            <Typography variant="body1" component="span">
              <b>{t('menuItem.fields.children')}</b>:
            </Typography>
            {renderItems(to[field], true, id)}
          </Box>
        );
      }
      const fieldName = t(`menuItem.fields.${field}`);
      let fieldValueFrom = from?.[field];
      let fieldValueTo = to[field];
      if (field === 'enabled') {
        fieldValueFrom = fieldValueFrom ? t('common.yes') : t('common.no');
        fieldValueTo = fieldValueTo ? t('common.yes') : t('common.no');
      }
      if (!fieldValueFrom && !fieldValueTo) return null;
      if (from?.[field] === undefined || from?.[field] === null) {
        if (field === 'label') return null;
        return (
          <Typography
            variant="body1"
            component="span"
            key={field}
            sx={{ ml: '1rem', my: '0.25rem' }}
          >
            <b>{fieldName}</b>: {fieldValueTo}
          </Typography>
        );
      }
      return (
        <Box className="flex flex-col my-1 ml-4" key={field}>
          <Typography variant="body1" component="span">
            <b>{fieldName}</b>:
          </Typography>
          {renderChanges(fieldValueFrom, fieldValueTo)}
        </Box>
      );
    });
  };

  const renderItems = (items: any[], isChildren?: boolean, parentId?: number) => {
    if (!items)
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    return Object.keys(items).map(index => {
      const from = isChildren
        ? data.menu.currentRevision.snapshot.items?.filter(i => i.parentId === parentId)[index]
        : data.menu.currentRevision.snapshot.items?.[index];
      const to = items[index];
      if (to === null)
        return (
          <Box className="flex flex-col my-2" key={index}>
            <Typography variant="h5" component="h5" className="line-through">
              {from.order}. {from.label}
            </Typography>
            <Typography variant="body1" component="p" sx={{ ml: '1rem', color: 'error.main' }}>
              {t('common.deleted', { context: 'male' })}
            </Typography>
          </Box>
        );
      if (!from || (to.id && from.id !== to.id))
        return (
          <Box className="flex flex-col my-2" key={index}>
            <Typography variant="h5" component="h5">
              {to.order}. {to.label}
            </Typography>
            <Typography variant="body1" component="p" sx={{ ml: '1rem', color: 'success.main' }}>
              {t('common.added', { context: 'male' })}
            </Typography>
            {renderItemChanges(from, to)}
          </Box>
        );
      return (
        <Box className="flex flex-col my-2" key={index}>
          <Typography variant="h5" component="h5">
            {to.order || from.order}. {to.label || from.label}:
          </Typography>
          {renderItemChanges(from, to)}
        </Box>
      );
    });
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
        <title>{t('menuRevision.create.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../' },
          { label: t('menuRevision.create.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ my: '1rem' }}>
        {t('menuRevision.create.title')}
      </Typography>
      <Typography variant="h2" component="h2" sx={{ my: '0.5rem' }}>
        {t('menuRevision.create.reviewChanges.title')}
      </Typography>
      <Typography variant="body1" component="p" sx={{ my: '0.5rem' }}>
        {t('menuRevision.create.reviewChanges.description')}
      </Typography>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.name')}:
        </Typography>
        {renderChanges(data?.menu.currentRevision?.snapshot.name, menuDiff?.name)}
      </Box>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.meta.title', { count: 2 })}:
        </Typography>
        {renderMeta()}
      </Box>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.items')}:
        </Typography>
        {renderItems(menuDiff?.items)}
      </Box>
    </Box>
  );
};

export default CreateRevision;
