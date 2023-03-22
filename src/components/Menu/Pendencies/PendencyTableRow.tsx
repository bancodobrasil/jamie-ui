import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { DateTime } from 'luxon';
import { Box, Divider, TableRow, Typography, TableCell, IconButton, Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { EnumInputAction, IMenu, IMenuPendency } from '../../../types';
import CodeViewer from '../../CodeViewer';
import { IUpdateMenuItemInput, IUpdateMenuMetaInput } from '../../../types/input';

const PendencyChanges = ({ menu, pendency }: { menu: IMenu; pendency: IMenuPendency }) => {
  const { i18n, t } = useTranslation();

  const getActionColor = (action: EnumInputAction) => {
    switch (action) {
      case EnumInputAction.CREATE:
        return 'success.main';
      case EnumInputAction.UPDATE:
        return 'warning.main';
      case EnumInputAction.DELETE:
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const renderItemMeta = (meta: Record<string, unknown>) =>
    Object.keys(meta).map((key, index) => {
      const value = meta[key];
      return (
        <React.Fragment key={index}>
          {index > 0 && <Divider sx={{ my: '1rem', mx: '1rem' }} />}
          <Typography>
            <b>{key}:</b> {value}
          </Typography>
        </React.Fragment>
      );
    });

  const renderItem = (menu: IMenu, item: IUpdateMenuItemInput, index: number) => {
    const order = item.order || menu.items.find(i => i.id === item.id)?.order || index + 1;
    const label = menu.items.find(i => i.id === item.id)?.label || item.label;
    const actionColor = getActionColor(item.action);
    return (
      <Box className="flex flex-col">
        <Box className="flex flex-row items-center min-w-fit">
          <Typography variant="h4" component="h4" sx={{ mr: '0.5rem' }}>
            #{order}
          </Typography>
          <Typography sx={{ minWidth: 'fit-content', mr: '1rem' }}>{label}</Typography>
        </Box>
        <Box className="flex flex-col space-y-1 mx-[2.2rem]">
          <Box className="flex flex-row space-x-1.5">
            <Typography>
              <b>{t('inputAction.title')}</b>
            </Typography>
            <Typography color={actionColor}>{t(`inputAction.actions.${item.action}`)}</Typography>
          </Box>
          {item.label && (
            <Typography>
              <b>{t('menuItem.fields.label')}</b>: {item.label}
            </Typography>
          )}
          {item.order && (
            <Typography>
              <b>{t('menuItem.fields.order')}</b>: {item.order}
            </Typography>
          )}
          {item.enabled !== undefined && (
            <Typography>
              <b>{t('menuItem.fields.enabled')}</b>:{' '}
              {item.enabled ? t('common.yes') : t('common.no')}
            </Typography>
          )}
          {item.startPublication && (
            <Typography>
              <b>{t('menuItem.fields.startPublication')}</b>:{' '}
              {DateTime.fromISO(item.startPublication)
                .setLocale(i18n.language)
                .toLocaleString(DateTime.DATETIME_FULL)}
            </Typography>
          )}
          {item.endPublication && (
            <Typography>
              <b>{t('menuItem.fields.endPublication')}</b>:{' '}
              {DateTime.fromISO(item.endPublication)
                .setLocale(i18n.language)
                .toLocaleString(DateTime.DATETIME_FULL)}
            </Typography>
          )}
          {item.templateFormat && (
            <Typography>
              <b>{t('menuItem.fields.templateFormat.title')}</b>:{' '}
              {t(`menuItem.fields.templateFormat.formats.${item.templateFormat}`)}
            </Typography>
          )}
          {item.template && (
            <Box className="flex flex-col space-y-2">
              <Typography>
                <b>{t('menuItem.fields.template')}</b>:
              </Typography>
              <CodeViewer code={item.template} language="handlebars" />
            </Box>
          )}
          {item.meta && Object.keys(item.meta).length > 0 && (
            <Box className="flex flex-col space-y-1">
              <Typography variant="h6" component="h6">
                <b>{t('menu.fields.meta.title', { count: Object.keys(item.meta).length })}</b>:
              </Typography>
              <Box className="flex flex-col space-y-1 mx-4">{renderItemMeta(item.meta)}</Box>
            </Box>
          )}
          {item.children && item.children.length > 0 && (
            <Box className="flex flex-col space-y-1">
              <Typography variant="h6" component="h6">
                <b>{t('menuItem.fields.children')}</b>:
              </Typography>
              {item.children.map((child, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider sx={{ my: '1rem', mx: '1rem' }} />}
                  <Box className="flex flex-col space-y-1 mx-4">
                    {renderItem(menu, child, index)}
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderMeta = (menu: IMenu, meta: IUpdateMenuMetaInput) => {
    const order = meta.order || menu.meta.find(m => m.id === meta.id)?.order;
    const name = menu.meta.find(m => m.id === meta.id)?.name || meta.name;
    const actionColor = getActionColor(meta.action);
    return (
      <Box className="flex flex-col">
        <Box className="flex flex-row items-center min-w-fit">
          <Typography variant="h4" component="h4" sx={{ mr: '0.5rem' }}>
            #{order}
          </Typography>
          <Typography sx={{ minWidth: 'fit-content', mr: '1rem' }}>{name}</Typography>
        </Box>
        <Box className="flex flex-col space-y-1 mx-[2.2rem]">
          <Box className="flex flex-row space-x-1.5">
            <Typography>
              <b>{t('inputAction.title')}</b>:
            </Typography>
            <Typography
              sx={{
                color: actionColor,
              }}
            >
              {t(`inputAction.actions.${meta.action}`)}
            </Typography>
          </Box>
          {meta.name && (
            <Typography>
              <b>{t('menu.fields.meta.name')}</b>: {meta.name}
            </Typography>
          )}
          {meta.type && (
            <Typography>
              <b>{t('menu.fields.meta.type.title', { count: 1 })}</b>:{' '}
              {t(`menu.fields.meta.type.${meta.type}`)}
            </Typography>
          )}
          {meta.enabled !== undefined && (
            <Typography>
              <b>{t('menu.fields.meta.enabled')}</b>:{' '}
              {meta.enabled ? t('common.yes') : t('common.no')}
            </Typography>
          )}
          {meta.required !== undefined && (
            <Typography>
              <b>{t('menu.fields.meta.required')}</b>:{' '}
              {meta.required ? t('common.yes') : t('common.no')}
            </Typography>
          )}
          {meta.defaultValue && (
            <Typography>
              <b>{t('menu.fields.meta.defaultValue')}</b>: {meta.defaultValue}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box className="space-y-2">
      {pendency.input.name && (
        <Box className="flex flex-row space-x-1.5">
          <Typography>
            <b>{t('menu.fields.name')}</b>:
          </Typography>
          <Typography>{pendency.input.name}</Typography>
        </Box>
      )}
      {pendency.input.templateFormat && (
        <Box className="flex flex-row space-x-1.5">
          <Typography>
            <b>{t('menu.fields.templateFormat.title')}</b>:
          </Typography>
          <Typography>
            {t(`menu.fields.templateFormat.formats.${pendency.input.templateFormat}`)}
          </Typography>
        </Box>
      )}
      {pendency.input.template && (
        <Box className="flex flex-col space-y-2">
          <Typography>
            <b>{t('menu.fields.template')}</b>:
          </Typography>
          <CodeViewer code={pendency.input.template} language="handlebars" />
        </Box>
      )}
      {pendency.input.meta && pendency.input.meta.length > 0 && (
        <Box className="flex flex-col">
          <Typography variant="h6" component="h6" sx={{ mb: '0.5rem' }}>
            <b>{t('menu.fields.meta.title', { count: pendency.input.meta.length })}</b>
          </Typography>
          {pendency.input.meta.map((meta, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider sx={{ my: '1rem', mx: '1rem' }} />}
              <Box className="flex flex-col space-y-1 mx-4">{renderMeta(menu, meta)}</Box>
            </React.Fragment>
          ))}
        </Box>
      )}
      {pendency.input.items && pendency.input.items.length > 0 && (
        <Box className="flex flex-col">
          <Typography variant="h6" component="h6" sx={{ mb: '0.5rem' }}>
            <b>{t('menu.fields.items')}</b>
          </Typography>
          {pendency.input.items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider sx={{ my: '1rem', mx: '1rem' }} />}
              <Box className="flex flex-col space-y-1 mx-4">{renderItem(menu, item, index)}</Box>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};

interface PedencyTableRowProps {
  menu: IMenu;
  pendency: IMenuPendency;
  acceptPendency: (pendencyId: number) => void;
  rejectPendency: (pendencyId: number) => void;
  loadingSubmit: boolean;
}

export const PendencyTableRow = ({
  menu,
  pendency,
  acceptPendency,
  rejectPendency,
  loadingSubmit,
  ...props
}: PedencyTableRowProps) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment {...props}>
      <TableRow sx={{ '& > *': { borderBottom: 'unset !important' } }}>
        <TableCell>
          <IconButton aria-label="row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {DateTime.fromISO(pendency.createdAt)
            .setLocale(i18n.language)
            .toLocaleString(DateTime.DATETIME_FULL)}
        </TableCell>
        <TableCell>{pendency.submittedBy.username}</TableCell>
        <TableCell align="center">
          <IconButton
            aria-label={t('menu.pendencies.actions.accept')}
            size="small"
            color="success"
            title={t('menu.pendencies.actions.accept')}
            disabled={loadingSubmit}
            onClick={() => acceptPendency(pendency.id)}
          >
            <ThumbUpOffAltIcon />
          </IconButton>
          <IconButton
            aria-label={t('menu.pendencies.actions.reject')}
            size="small"
            color="error"
            title={t('menu.pendencies.actions.reject')}
            disabled={loadingSubmit}
            onClick={() => rejectPendency(pendency.id)}
          >
            <ThumbDownOffAltIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: '16px', pb: '16px' }}>
              <Typography variant="h5" component="h5" sx={{ mb: '0.5rem' }}>
                {t('menu.fields.pendency.input')}
              </Typography>
              <PendencyChanges menu={menu} pendency={pendency} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
