import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useQuery } from '@apollo/client';
import MenuService from '../../../api/services/MenuService';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import './List.style.css';

const MENU_LIST_DEFAULT_PAGE_SIZE = 10;

export const ListMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState<number>(MENU_LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState<number>(0);
  const [count] = useState<number>(0);

  const { loading, error, data, refetch } = useQuery(MenuService.GET_LIST_MENU);

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
    [t, navigate],
  );

  const handleButtonCreateOnClick = () => {
    navigate('create');
  };

  const loadMenus = async (page, limit) => {
    refetch();
  };

  const onPageSizeChangeHandler = (newPageSize: number) => {
    setPageSize(newPageSize);
    loadMenus(page + 1, newPageSize);
  };

  const onPageChangeHandler = (newPage: number) => {
    setPage(newPage);
    loadMenus(newPage + 1, pageSize);
  };

  const onSelectionModelChangeHandler = (selectionModel: GridSelectionModel) => {
    if (selectionModel.length > 0) {
      navigate(`${selectionModel[0].toString()}`);
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
    <>
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
            rows={data?.menus || []}
            columns={columns}
            paginationMode="server"
            pagination
            pageSize={pageSize}
            page={page}
            rowCount={count}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            onPageSizeChange={onPageSizeChangeHandler}
            onPageChange={onPageChangeHandler}
            loading={loading}
            autoHeight
            onSelectionModelChange={onSelectionModelChangeHandler}
          />
        </Paper>
      </Box>
    </>
  );
};
