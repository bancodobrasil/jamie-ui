import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import MenuItemService from '../../../api/services/MenuItemService';
import Loading from '../../../components/Loading';
import DefaultErrorPage from '../../../components/DefaultErrorPage';

export const EditTemplate = () => {
  const { itemId } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [template, setTemplate] = React.useState("console.log('hello world!');");

  const { loading, error, data } = useQuery(MenuItemService.GET_MENU_ITEM, {
    variables: { id: Number(itemId) },
  });

  const onBackClickHandler = () => {
    navigate('/');
  };

  const onChange = React.useCallback((value, viewUpdate) => {
    setTemplate(value);
  }, []);

  if (loading) return <Loading />;

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 1,
            field: t('menuItem.title', { count: 1 }),
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
    <Box>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menuItem.menu.name, navigateTo: '../../' },
          { label: t('menu.preview.title'), navigateTo: '../' },
          { label: data?.menuItem.label },
        ]}
        onBack={onBackClickHandler}
      />
      <Box
        sx={{
          width: '100%',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: '2rem',
            letterSpacing: '0.18px',
            mb: '1rem',
          }}
        >
          {t('menuItem.editTemplate.title')}
        </Typography>
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', flex: 1 }}>
          <CodeMirror
            value={template}
            height="200px"
            extensions={[javascript({ jsx: true })]}
            onChange={onChange}
            minHeight="60vh"
            minWidth="40vw"
          />
        </Box>
      </Box>
    </Box>
  );
};
