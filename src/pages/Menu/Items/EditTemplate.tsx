import React from 'react';
import { Box, FormControl, Link, MenuItem, Select, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { ejs as ejsLang } from 'codemirror-lang-ejs';
import ejs from 'ejs';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import MenuItemService from '../../../api/services/MenuItemService';
import Loading from '../../../components/Loading';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import { ejsJson } from '../../../utils/codemirror/ejs-json';
import { ejsXml } from '../../../utils/codemirror/ejs-xml';
import CodeViewer from '../../../components/CodeViewer';
import MenuItemInitialTemplate from '../../../utils/template/MenuItemInitialTemplate';

enum EnumTemplateFormat {
  JSON = 'json',
  XML = 'xml',
  PLAIN = 'plain',
}

export const EditTemplateItems = () => {
  const { itemId } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [templateFormat, setTemplateFormat] = React.useState(EnumTemplateFormat.JSON);
  const [template, setTemplate] = React.useState({
    [EnumTemplateFormat.JSON]: MenuItemInitialTemplate.JSON,
    [EnumTemplateFormat.XML]: MenuItemInitialTemplate.XML,
    [EnumTemplateFormat.PLAIN]: MenuItemInitialTemplate.PLAIN,
  });
  const [templateResult, setTemplateResult] = React.useState('');

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
        setLanguage(ejsLang);
        break;
    }
  }, [templateFormat]);

  const { loading, error, data } = useQuery(MenuItemService.GET_MENU_ITEM, {
    variables: { id: Number(itemId) },
  });

  React.useEffect(() => {
    if (!data) return;
    const item = data?.menuItem;
    const children = item.children.map(child => ({
      id: child.id,
      label: child.label,
      order: child.order,
      meta: child.meta,
    }));
    try {
      const result = ejs.render(template[templateFormat], {
        item: {
          id: item.id,
          label: item.label,
          order: item.order,
          meta: item.meta,
          children,
        },
      });
      if (templateFormat === EnumTemplateFormat.JSON) {
        setTemplateResult(JSON.stringify(JSON.parse(result), null, 2));
        return;
      }
      setTemplateResult(result);
    } catch (error) {
      /* empty */
    }
  }, [template, templateFormat, data]);

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
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
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
          sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between' }}
        >
          <Box
            sx={{
              maxWidth: '40vw',
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
              <FormControl
                sx={{
                  ml: '4rem',
                  width: 120,
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
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
                height="60vh"
                extensions={[language]}
                theme={dracula}
                onChange={onChange}
                maxHeight="60vh"
                width="40vw"
              />
            </Box>
          </Box>
          <Box
            sx={{
              maxWidth: '40vw',
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
                  {t('menuItem.editTemplate.result.title')}
                </Typography>
                <Typography variant="body1" component="p" sx={{ mt: '0.5rem' }}>
                  {t('menuItem.editTemplate.result.description')}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                maxHeight: '60vh',
                minHeight: '60vh',
                width: '100%',
                display: 'flex',
                flex: 1,
                mt: '1rem',
                overflowY: 'auto',
              }}
            >
              <CodeViewer code={templateResult} language={templateFormat} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
