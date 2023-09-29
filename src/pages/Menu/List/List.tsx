import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';
import { DateTime } from 'luxon';
import MenuService from '../../../api/services/MenuService';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import './List.style.css';
import { Edge, IMenu } from '../../../types';

const MENU_LIST_DEFAULT_PAGE_SIZE = 10;

export const ListMenu = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState<number>(MENU_LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  const { loading, error, data, refetch } = useQuery(MenuService.LIST_MENUS, {
    variables: { first: pageSize, after: '', last: 0, before: '', sort: 'Id', direction: 'ASC' },
  });
  const [fetched, setFetched] = useState<boolean>(false);
  const [menus, setMenus] = useState<IMenu[]>([]);

  useEffect(() => {
    if (!data) return;
    setMenus(data.menus.edges.map((item: Edge<IMenu>) => item.node));
    setCount(data.menus.totalCount);
    setFetched(true);
  }, [data]);

  useEffect(() => {
    if (!!data && !fetched) {
      refetch({ first: pageSize, after: '', last: 0, before: '', sort: 'Id', direction: 'ASC' });
    }
  }, [fetched, data, pageSize, refetch]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: t('common.fields.id'),
        disableColumnMenu: true,
        minWidth: 50,
      },
      {
        field: 'name',
        headerName: t('menu.of', { field: 'name' }),
        disableColumnMenu: true,
        minWidth: 300,
        flex: 1,
      },
      {
        field: 'createdAt',
        headerName: t('common.fields.createdAt'),
        disableColumnMenu: true,
        minWidth: 200,
        renderCell: params =>
          DateTime.fromISO(params.value)
            .setLocale(i18n.language)
            .toLocaleString(DateTime.DATETIME_SHORT),
      },
      {
        field: 'updatedAt',
        headerName: t('common.fields.updatedAt'),
        disableColumnMenu: true,
        minWidth: 200,
        renderCell: params =>
          DateTime.fromISO(params.value)
            .setLocale(i18n.language)
            .toLocaleString(DateTime.DATETIME_SHORT),
      },
      {
        field: 'currentRevisionId',
        headerName: t('menu.fields.currentRevision'),
        disableColumnMenu: true,
        sortable: false,
        minWidth: 150,
        renderCell: params => params.value || '-',
      },
      {
        field: 'publishedRevisionId',
        headerName: t('menu.fields.publishedRevision'),
        disableColumnMenu: true,
        sortable: false,
        minWidth: 150,
        renderCell: params => params.value || '-',
      },
      {
        field: '',
        headerName: '',
        headerClassName: 'MuiDataGrid-headerHidden',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        renderCell: params => {
          const onArrowIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            navigate(`${params.id.toString()}`);
          };

          return (
            <IconButton onClick={onArrowIconClick}>
              <ArrowForwardIosRoundedIcon fontSize="small" />
            </IconButton>
          );
        },
      },
    ],
    [t, i18n, navigate],
  );

  const handleButtonCreateOnClick = () => {
    navigate('create');
  };

  const onPageSizeChangeHandler = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
    refetch({
      first: newPageSize,
      after: '',
      last: 0,
      before: '',
      direction: 'ASC',
    });
  };

  const onPageChangeHandler = (newPage: number) => {
    const diff = newPage - page;
    setPage(newPage);
    if (diff > 0) {
      refetch({
        first: pageSize,
        after: data?.menus.pageInfo.endCursor,
        last: 0,
        before: '',
        direction: 'ASC',
      });
    } else {
      refetch({
        first: 0,
        after: '',
        last: pageSize,
        before: data?.menus.pageInfo.startCursor,
        direction: 'DESC',
      });
    }
  };

  const onSelectionModelChangeHandler = (selectionModel: GridSelectionModel) => {
    if (selectionModel.length > 0) {
      navigate(`${selectionModel[0].toString()}/edit`);
    }
  };

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 2,
            field: t('menu.title', { count: 2 }),
          }).toLowerCase(),
        })}
        description={t('error.failedToLoadResource.description')}
        button={{
          label: t('error.failedToLoadResource.button'),
          onClick: () => document.location.reload(),
        }}
      />
    );

  return (
    <Box sx={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
      <Helmet>
        <title>{t('menu.list.title')}</title>
      </Helmet>
      <Box
        sx={{
          width: '100%',
          paddingTop: '16px',
          paddingBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h1" component="h1" sx={{ mt: '2rem' }}>
            {t('menu.list.title')}
          </Typography>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button variant="contained" color="primary" onClick={handleButtonCreateOnClick}>
              {t('buttons.new')}
            </Button>
          </Box>
        </Box>
        <Paper
          sx={{
            marginTop: '16px',
          }}
          elevation={0}
        >
          <DataGrid
            sx={{
              '& .MuiDataGrid-main .MuiDataGrid-cell': {
                cursor: 'pointer',
              },
            }}
            rows={menus}
            columns={columns}
            paginationMode="server"
            pagination
            pageSize={pageSize}
            page={page}
            rowCount={count}
            rowsPerPageOptions={[1, 5, 10, 25, 50, 100]}
            onPageSizeChange={onPageSizeChangeHandler}
            onPageChange={onPageChangeHandler}
            loading={loading}
            autoHeight
            onSelectionModelChange={onSelectionModelChangeHandler}
          />
        </Paper>
      </Box>
    </Box>
  );
};
