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
    const { name, template, templateFormat, currentRevision } = data.menu;
    let { items, meta } = data.menu;
    const removeTypename = (arr: any[]) =>
      arr.map(item => {
        const { __typename, ...rest } = item;
        return rest;
      });
    items = items && removeTypename(items);
    meta = meta && removeTypename(meta);
    if (!currentRevision) return { name, meta, items, template, templateFormat };
    const updatedMeta = currentRevision.snapshot.meta?.map((item: any, index: number) => {
      const current = meta?.[index];
      if (!current || item.id !== current.id || item.type !== current.type) return null;
      return current;
    });
    meta = [...(updatedMeta || []), ...(meta || [])].filter((item, index, arr) => {
      if (item === null) return true;
      return arr.findIndex(i => i?.id === item.id) === index;
    });
    console.log(
      deepDiff(currentRevision.snapshot, { name, meta, items, template, templateFormat }),
    );
    const diff = Object.entries(
      deepDiff(currentRevision.snapshot, { name, meta, items, template, templateFormat }),
    )
      .filter(([key, value]) => {
        if (value.to === undefined) {
          if (key.includes('meta')) {
            const index = key.split('.')[1];
            if (!meta[index]) {
              value.to = null;
              return true;
            }
          }
          if (key.includes('items')) {
            const index = key.split('.')[1];
            if (!items[index]) {
              value.to = null;
              return true;
            }
          }
          return false;
        }
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
    console.log(diff);
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
    </Box>
  );
};

export default CreateRevision;
