import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridSelectionModel } from '@mui/x-data-grid';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { TFunction } from 'i18next';
import React, { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import ErrorBoundary from '../../../components/ErrorBoundary';
import Loading from '../../../components/Loading';
import { IMenu, IPaginatedResponse } from '../../../types';
import { WrapPromise } from '../../../utils/suspense/WrapPromise';

const MENU_LIST_DEFAULT_PAGE_SIZE = 10;

interface Props {
  resource: WrapPromise<IPaginatedResponse<IMenu>>;
  t: TFunction;
}

const PageWrapper = ({ resource, t }: Props) => {
  const initialData = resource.read();

  const [pageSize, setPageSize] = useState<number>(MENU_LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState<number>(0);
  const [count] = useState<number>(initialData.total);

  const [menus, setMenus] = useState<IMenu[]>(initialData.data);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: t('menu.of', { field: 'name' }),
        minWidth: 300,
        flex: 1,
      },
      {
        field: '',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: 'right',
        renderCell: params => {
          const onArrowIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            navigate(params.id.toString());
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

  const loadRuleSheets = async (page, limit) => {
    setLoading(true);
    const newMenus = await MenuService.getListMenuSync({
      page,
      limit,
    });
    setMenus(newMenus.data);
    setLoading(false);
  };

  const onPageSizeChangeHandler = (newPageSize: number) => {
    setPageSize(newPageSize);
    loadRuleSheets(page + 1, newPageSize);
  };

  const onPageChangeHandler = (newPage: number) => {
    setPage(newPage);
    loadRuleSheets(newPage + 1, pageSize);
  };

  const onSelectionModelChangeHandler = (selectionModel: GridSelectionModel) => {
    if (selectionModel.length > 0) {
      navigate(selectionModel[0].toString());
    }
  };

  return (
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
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          onPageSizeChange={onPageSizeChangeHandler}
          onPageChange={onPageChangeHandler}
          loading={loading}
          autoHeight
          onSelectionModelChange={onSelectionModelChangeHandler}
        />
      </Paper>
    </Box>
  );
};

export const ListMenu = () => {
  const { t } = useTranslation();

  const resource = MenuService.getListMenu({ page: 1, limit: MENU_LIST_DEFAULT_PAGE_SIZE });

  return (
    <ErrorBoundary
      fallback={
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
      }
    >
      <Suspense fallback={<Loading />}>
        <PageWrapper resource={resource} t={t} />
      </Suspense>
    </ErrorBoundary>
  );
};
