import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableHead,
  Typography,
  TableContainer,
  TableRow,
  TableCell,
  IconButton,
  TablePagination,
  Collapse,
  Divider,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { DateTime } from 'luxon';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { Edge, EnumInputAction, IMenu, IMenuPendency } from '../../../types';
import CodeViewer from '../../../components/CodeViewer';
import { IUpdateMenuItemInput, IUpdateMenuMetaInput } from '../../../types/input';

const PENDENCY_LIST_DEFAULT_PAGE_SIZE = 10;

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

  const renderItem = (menu: IMenu, item: IUpdateMenuItemInput) => {
    const order = item.order || menu.items.find(i => i.id === item.id)?.order;
    const actionColor = getActionColor(item.action);
    return (
      <Box className="flex flex-row">
        <Typography variant="h4" component="h4" sx={{ mr: '1rem' }}>
          #{order}
        </Typography>
        <Box className="flex flex-col space-y-1">
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
                  <Box className="flex flex-col space-y-1 mx-4">{renderItem(menu, child)}</Box>
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
    const actionColor = getActionColor(meta.action);
    return (
      <Box className="flex flex-row">
        <Typography variant="h4" component="h4" sx={{ mr: '1rem' }}>
          #{order}
        </Typography>
        <Box className="flex flex-col space-y-1">
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
              <Box className="flex flex-col space-y-1 mx-4">{renderItem(menu, item)}</Box>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};

interface RowProps {
  menu: IMenu;
  pendency: IMenuPendency;
}

const Row = ({ menu, pendency, ...props }: RowProps) => {
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

const ListPendencies = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const [pageSize, setPageSize] = React.useState<number>(PENDENCY_LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = React.useState<number>(0);
  const [count, setCount] = React.useState<number>(0);

  const getMenuQuery = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const listPendenciesQuery = useQuery(MenuService.LIST_MENU_PENDENCIES, {
    variables: { menuId: Number(id), first: pageSize, after: '', last: 0, before: '' },
  });

  const [fetched, setFetched] = React.useState<boolean>(false);
  const [pendencies, setPendencies] = React.useState<IMenuPendency[]>([]);

  React.useEffect(() => {
    if (!listPendenciesQuery.data) return;
    setPendencies(
      listPendenciesQuery.data.pendencies.edges.map((item: Edge<IMenuPendency>) => item.node),
    );
    setCount(listPendenciesQuery.data.pendencies.totalCount);
    setFetched(true);
  }, [listPendenciesQuery.data]);

  React.useEffect(() => {
    if (!!listPendenciesQuery.data && !fetched) {
      listPendenciesQuery.refetch({
        first: pageSize,
        after: '',
        last: 0,
        before: '',
      });
    }
  }, [
    fetched,
    listPendenciesQuery,
    listPendenciesQuery.data,
    pageSize,
    listPendenciesQuery.refetch,
  ]);

  const onPageSizeChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(+event.target.value);
    setPage(0);
    listPendenciesQuery.refetch({
      first: +event.target.value,
      after: '',
      last: 0,
      before: '',
    });
  };

  const onPageChangeHandler = (event: unknown, newPage: number) => {
    const diff = newPage - page;
    setPage(newPage);
    if (diff > 0) {
      listPendenciesQuery.refetch({
        first: pageSize,
        after: listPendenciesQuery.data?.pendencies.pageInfo.endCursor,
        last: 0,
        before: '',
      });
    } else {
      listPendenciesQuery.refetch({
        first: 0,
        after: '',
        last: pageSize,
        before: listPendenciesQuery.data?.pendencies.pageInfo.startCursor,
      });
    }
  };

  if (getMenuQuery.error || listPendenciesQuery.error)
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

  if (getMenuQuery.loading || listPendenciesQuery.loading) return <Loading />;

  return (
    <Box>
      <Helmet>
        <title>{t('menu.pendencies.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: getMenuQuery.data?.menu.name, navigateTo: '../' },
          { label: t('menu.pendencies.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ my: '1rem' }}>
        {t('menu.pendencies.title')}
      </Typography>
      {pendencies.length === 0 ? (
        <Typography variant="body1" component="h2" sx={{ my: '0.5rem' }}>
          <span className="text-gray-500">{t('common.noData')}</span>
        </Typography>
      ) : (
        <>
          <Typography variant="body1" component="h2" sx={{ my: '0.5rem' }}>
            {t('menu.pendencies.description')}
          </Typography>
          <Paper sx={{ width: '100%' }}>
            <TableContainer>
              <Table aria-label="collapsible table" sx={{ tableLayout: 'auto', width: '30rem' }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>{t('menu.fields.pendency.createdAt')}</TableCell>
                    <TableCell>{t('menu.fields.pendency.submittedBy')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendencies.map(pendency => (
                    <Row key={pendency.id} pendency={pendency} menu={getMenuQuery.data?.menu} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[1, 5, 10, 25, 50, 100]}
              component="div"
              count={count}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={onPageChangeHandler}
              onRowsPerPageChange={onPageSizeChangeHandler}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ListPendencies;
