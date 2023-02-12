import React from 'react';
import { Box, FormControl, Link, MenuItem, Select, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { ejs } from 'codemirror-lang-ejs';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import MenuItemService from '../../../api/services/MenuItemService';
import Loading from '../../../components/Loading';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import { ejsJson } from '../../../utils/codemirror/ejs-json';
import { ejsXml } from '../../../utils/codemirror/ejs-xml';
import {
  JSON_INITIAL_TEMPLATE,
  PLAINTEXT_INITIAL_TEMPLATE,
  XML_INITIAL_TEMPLATE,
} from '../../../constants/template';

enum EnumTemplateFormat {
  JSON = 'json',
  XML = 'xml',
  PLAIN = 'plain',
}

export const EditTemplate = () => {
  const { itemId } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [templateFormat, setTemplateFormat] = React.useState(EnumTemplateFormat.JSON);
  const [template, setTemplate] = React.useState({
    [EnumTemplateFormat.JSON]: JSON_INITIAL_TEMPLATE,
    [EnumTemplateFormat.XML]: XML_INITIAL_TEMPLATE,
    [EnumTemplateFormat.PLAIN]: PLAINTEXT_INITIAL_TEMPLATE,
  });

  const [language, setLanguage] = React.useState(ejsJson);

  React.useEffect(() => {
    switch (templateFormat) {
      case EnumTemplateFormat.JSON:
        setLanguage(ejsJson);
        break;
      case EnumTemplateFormat.XML:
        setLanguage(ejsXml);
        break;
      case EnumTemplateFormat.PLAIN:
        setLanguage(ejs);
        break;
    }
  }, [templateFormat]);

  const { loading, error, data } = useQuery(MenuItemService.GET_MENU_ITEM, {
    variables: { id: Number(itemId) },
  });

  const onChangeTemplateFormat = React.useCallback(event => {
    setTemplateFormat(event.target.value);
  }, []);

  const onChange = React.useCallback(
    (value: string) => {
      setTemplate(prevState => ({
        ...prevState,
        [templateFormat]: value,
      }));
    },
    [templateFormat],
  );

  const onBackClickHandler = () => {
    navigate('/');
  };

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
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              flex: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: '40vw',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  flex: 1,
                }}
              >
                <Typography variant="h2" component="h2">
                  {t('menuItem.editTemplate.templateFormat.title')}
                </Typography>
                <Typography variant="body1" component="p" sx={{ mt: '0.5rem' }}>
                  <Trans i18nKey="menuItem.editTemplate.templateFormat.description">
                    X{' '}
                    <Link
                      href="https://ejs.co/"
                      rel="noopener noreferrer"
                      target="_blank"
                      underline="always"
                    >
                      Y
                    </Link>{' '}
                    Z
                  </Trans>
                </Typography>
              </Box>
              <FormControl sx={{ ml: '4rem', width: 120 }}>
                <Select value={templateFormat} onChange={onChangeTemplateFormat}>
                  <MenuItem value={EnumTemplateFormat.JSON}>
                    {t('menuItem.editTemplate.templateFormat.formats.json')}
                  </MenuItem>
                  <MenuItem value={EnumTemplateFormat.XML}>
                    {t('menuItem.editTemplate.templateFormat.formats.xml')}
                  </MenuItem>
                  <MenuItem value={EnumTemplateFormat.PLAIN}>
                    {t('menuItem.editTemplate.templateFormat.formats.plain')}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box
            sx={{
              width: '40vw',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              flex: 1,
            }}
          >
            <CodeMirror
              value={template[templateFormat]}
              height="200px"
              extensions={[language]}
              theme={dracula}
              onChange={onChange}
              minHeight="60vh"
              width="40vw"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
