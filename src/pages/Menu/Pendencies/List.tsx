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
  TablePagination,
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { Edge, IMenuPendency } from '../../../types';
import { PendencyTableRow } from '../../../components/Menu/Pendencies';

const PENDENCY_LIST_DEFAULT_PAGE_SIZE = 10;

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
              <Table aria-label="collapsible table" sx={{ tableLayout: 'auto', width: '35rem' }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>{t('menu.fields.pendency.createdAt')}</TableCell>
                    <TableCell>{t('menu.fields.pendency.submittedBy')}</TableCell>
                    <TableCell align="center">{t('menu.pendencies.actions.title')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendencies.map(pendency => (
                    <PendencyTableRow
                      key={pendency.id}
                      pendency={pendency}
                      menu={getMenuQuery.data?.menu}
                    />
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
