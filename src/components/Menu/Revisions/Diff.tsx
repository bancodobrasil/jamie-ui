import React from 'react';
import { Box, styled, Typography } from '@mui/material';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { useTranslation } from 'react-i18next';
import { codeDiff } from '../../../utils/diff/codeDiff';
import CodeViewer from '../../CodeViewer';

interface Props {
  id: string;
  diff: any;
  snapshot: any;
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export const MenuRevisionsDiff = ({ id, diff, snapshot }: Props) => {
  const { t } = useTranslation();

  const renderTemplateChanges = (from: any, to: any, linkPath: string) => {
    if (to === undefined || (from === undefined && to === null))
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    if (to === null)
      return (
        <Typography variant="body1" component="p" sx={{ color: 'error.main' }}>
          {t('common.deleted', { context: 'male' })}
        </Typography>
      );
    if (!linkPath)
      return (
        <Typography variant="body1" component="p" sx={{ color: 'warning.main' }}>
          {t('common.changed', { context: 'male' })}
        </Typography>
      );
    const fromTemplate = from || '';
    const templateDiff = codeDiff(fromTemplate, to);
    return (
      <Accordion>
        <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
          {t('common.viewChanges')}
        </AccordionSummary>
        <AccordionDetails>
          <CodeViewer code={templateDiff} language="handlebars" diff />
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderChanges = (from?: any, to?: any) => {
    if (to === undefined || (from === undefined && to === null) || from === to)
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
          {t('common.to')}: {to ? <b>{to}</b> : <i className="text-gray-500">{t('common.none')}</i>}
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
    if (!diff?.meta)
      return (
        <Typography variant="body1" component="p">
          {t('common.noChanges')}
        </Typography>
      );
    return Object.keys(diff.meta).map(index => {
      const from = snapshot?.meta[index];
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

  const renderItemMeta = (from: any, to: any) => {
    const ids = Object.keys(to);
    return ids.map(id => {
      const fromValue = from?.[id];
      const fromName = snapshot?.meta?.find((meta: any) => meta.id === Number(id))?.name;
      const toValue = to[id];
      let toName =
        diff.meta && Object.keys(diff.meta).find(key => diff.meta[key]?.id === Number(id));
      toName = toName ? diff.meta[toName].name : fromName;
      if (toValue === null)
        return (
          <Box className="flex flex-col my-1 ml-4" key={id}>
            <Typography variant="body1" component="span" className="line-through">
              <b>{fromName}</b>:
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: 'error.main' }}>
              {t('common.deleted', { context: 'male' })}
            </Typography>
          </Box>
        );
      if (!fromValue)
        return (
          <Box className="flex flex-col my-1 ml-4" key={id}>
            <Typography variant="body1" component="span">
              <b>{toName}</b>:
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: 'success.main' }}>
              {t('common.added', { context: 'male' })}
            </Typography>
            {renderChanges(fromValue, toValue)}
          </Box>
        );
      return (
        <Box className="flex flex-col my-1 ml-4" key={id}>
          <Typography variant="body1" component="span">
            <b>{toName}</b>:
          </Typography>
          {renderChanges(fromValue, toValue)}
        </Box>
      );
    });
  };

  const renderItemChanges = (from: any, to: any) => {
    const fields = Object.keys(to);
    return fields.map(field => {
      if (
        field === 'id' ||
        field === 'parentId' ||
        field === 'menuId' ||
        field === 'menu' ||
        field === 'defaultTemplate' ||
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
            {renderTemplateChanges(from?.[field], to[field], `/menus/${id}/items/${itemId}`)}
          </Box>
        );
      }
      if (field === 'meta') {
        return (
          <Box className="flex flex-col my-1 ml-4" key={field}>
            <Typography variant="body1" component="span">
              <b>{t('menu.fields.meta.title', { count: 2 })}</b>:
            </Typography>
            {renderItemMeta(from?.[field], to[field])}
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
        fieldValueFrom =
          fieldValueFrom && t(`menuItem.fields.templateFormat.formats.${fieldValueFrom}`);
        fieldValueTo = fieldValueTo && t(`menuItem.fields.templateFormat.formats.${fieldValueTo}`);
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
    return Object.keys(items)
      .sort((a, b) => {
        const aOrder = items[a]?.order;
        const bOrder = items[b]?.order;
        if (!aOrder || !bOrder) return Number(a) - Number(b);
        if (aOrder < bOrder) return -1;
        if (aOrder > bOrder) return 1;
        return 0;
      })
      .map(index => {
        const getChildren = (parentId: number, items?: any[]) => {
          let children;
          for (let i = 0; i < items?.length; i++) {
            if (items[i].id === parentId) {
              children = items[i].children;
              break;
            }
            children = getChildren(parentId, items[i].children);
            if (children) break;
          }
          return children || [];
        };
        const to = items[index];
        const from = isChildren
          ? getChildren(parentId, snapshot?.items)[index]
          : snapshot?.items?.[index];
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
                {to.order || from.order}. {to.label || from.label}
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
        {renderChanges(snapshot?.name, diff?.name)}
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
          snapshot?.templateFormat &&
            t(`menu.fields.templateFormat.formats.${snapshot.templateFormat}`),
          diff?.templateFormat && t(`menu.fields.templateFormat.formats.${diff?.templateFormat}`),
        )}
      </Box>
      <Box className="flex flex-col my-4">
        <Typography variant="h4" component="h4">
          {t('menu.fields.template')}:
        </Typography>
        {renderTemplateChanges(snapshot?.template, diff?.template, `/menus/${id}/editTemplate`)}
      </Box>
    </>
  );
};
