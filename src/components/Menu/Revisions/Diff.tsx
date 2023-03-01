import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Props {
  id: string;
  diff: any;
  snapshot: any;
}

export const MenuRevisionsDiff = ({ id, diff, snapshot }: Props) => {
  const { t } = useTranslation();

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

  const renderTemplateChanges = (to: any, linkPath: string) => {
    if (to === undefined)
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    return (
      <Typography variant="body1" component="span" sx={{ textDecorationLine: 'underline' }}>
        <Link to={linkPath}>{t('common.viewChanges')}</Link>
      </Typography>
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
    if (!diff?.meta)
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    return Object.keys(diff.meta).map(index => {
      const from = snapshot.meta[index];
      const to = diff.meta[index];
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
      if (field === 'template') {
        const itemId = from?.id || to.id;
        return (
          <Box className="flex flex-col my-1 ml-4" key={field}>
            <Typography variant="body1" component="span">
              <b>{t('menuItem.fields.template')}</b>:
            </Typography>
            {renderTemplateChanges(to[field], `/menus/${id}/items/${itemId}`)}
          </Box>
        );
      }
      const fieldName =
        field === 'templateFormat'
          ? t(`menuItem.fields.${field}.title`)
          : t(`menuItem.fields.${field}`);
      let fieldValueFrom = from?.[field];
      let fieldValueTo = to[field];
      if (field === 'enabled') {
        fieldValueFrom = fieldValueFrom ? t('common.yes') : t('common.no');
        fieldValueTo = fieldValueTo ? t('common.yes') : t('common.no');
      } else if (field === 'templateFormat') {
        fieldValueFrom = t(`menuItem.fields.templateFormat.formats.${fieldValueFrom}`);
        fieldValueTo = t(`menuItem.fields.templateFormat.formats.${fieldValueTo}`);
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
        ? snapshot.items?.filter(i => i.parentId === parentId)[index]
        : snapshot.items?.[index];
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

  return (
    <>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.name')}:
        </Typography>
        {renderChanges(snapshot.name, diff?.name)}
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
        {renderItems(diff?.items)}
      </Box>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.templateFormat.title')}:
        </Typography>
        {renderChanges(
          snapshot.templateFormat &&
            t(`menu.fields.templateFormat.formats.${snapshot.templateFormat}`),
          diff?.templateFormat && t(`menu.fields.templateFormat.formats.${diff?.templateFormat}`),
        )}
      </Box>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.template')}:
        </Typography>
        {renderTemplateChanges(diff?.template, `/menus/${id}/editTemplate`)}
      </Box>
    </>
  );
};
