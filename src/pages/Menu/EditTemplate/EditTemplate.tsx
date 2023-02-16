import React from 'react';
import { Box, Button, FormControl, Link, MenuItem, Select, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { ejs as ejsLang } from 'codemirror-lang-ejs';
// eslint-disable-next-line import/no-extraneous-dependencies
import ejs from 'ejs';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import MenuService from '../../../api/services/MenuService';
import Loading from '../../../components/Loading';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import { ejsJson } from '../../../utils/codemirror/ejs-json';
import { ejsXml } from '../../../utils/codemirror/ejs-xml';
import CodeViewer from '../../../components/CodeViewer';
import { EnumTemplateFormat, IMenu, IMenuItem } from '../../../types';
import MenuInitialTemplate from '../../../utils/template/MenuInitialTemplate';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';

export const EditTemplateMenu = () => {
  const { dispatch } = React.useContext(NotificationContext);

  const { id } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [templateFormat, setTemplateFormat] = React.useState(EnumTemplateFormat.JSON);
  const [template, setTemplate] = React.useState({
    [EnumTemplateFormat.JSON]: MenuInitialTemplate.JSON,
    [EnumTemplateFormat.XML]: MenuInitialTemplate.XML,
    [EnumTemplateFormat.PLAIN]: MenuInitialTemplate.PLAIN,
  });
  const [templateResult, setTemplateResult] = React.useState('');
  const [loadedInitialTemplate, setLoadedInitialTemplate] = React.useState(false);

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

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  React.useEffect(() => {
    if (!data || loadedInitialTemplate) return;
    const { menu }: { menu: IMenu } = data;
    if (menu.templateFormat) setTemplateFormat(menu.templateFormat);
    if (menu.template)
      setTemplate({
        ...template,
        [menu.templateFormat]: menu.template,
      });
    setLoadedInitialTemplate(true);
  }, [data, loadedInitialTemplate, template]);

  React.useEffect(() => {
    if (!data) return;
    const { menu }: { menu: IMenu & { __typename: string } } = data;
    let items: IMenuItem[] = menu.items || [];
    const getChildren = (parent: IMenuItem): IMenuItem[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map((item: IMenuItem & { __typename?: string }) => {
          const { __typename, template, templateFormat, ...rest } = item;
          let formattedTemplate = template;
          if (template) {
            formattedTemplate = ejs.render(template, {
              item: {
                ...rest,
                children: getChildren(item),
                templateFormat,
              },
            });
            if (templateFormat === EnumTemplateFormat.JSON) {
              formattedTemplate = JSON.parse(formattedTemplate);
            }
          }
          return {
            ...rest,
            children: getChildren(item),
            template: formattedTemplate,
            templateFormat,
          };
        })
        .sort((a, b) => a.order - b.order);
      return children;
    };
    items =
      items
        .map((item: IMenuItem & { __typename: string }) => {
          const { __typename, template, templateFormat, ...rest } = item;
          let formattedTemplate = template;
          if (template) {
            formattedTemplate = ejs.render(template, {
              item: {
                ...rest,
                children: getChildren(item),
                templateFormat,
              },
            });
            if (templateFormat === EnumTemplateFormat.JSON) {
              formattedTemplate = JSON.parse(formattedTemplate);
            }
          }
          return {
            ...rest,
            children: getChildren(item),
            template: formattedTemplate,
            templateFormat,
          };
        })
        .filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    try {
      const { __typename, template: menuTemplate, ...rest } = menu;
      const result = ejs.render(template[templateFormat], {
        menu: {
          ...rest,
          items,
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

  const resetDefaultTemplate = React.useCallback(() => {
    switch (templateFormat) {
      case EnumTemplateFormat.JSON:
        setTemplate({
          ...template,
          [templateFormat]: MenuInitialTemplate.JSON,
        });
        break;
      case EnumTemplateFormat.XML:
        setTemplate({
          ...template,
          [templateFormat]: MenuInitialTemplate.XML,
        });
        break;
      case EnumTemplateFormat.PLAIN:
        setTemplate({
          ...template,
          [templateFormat]: MenuInitialTemplate.PLAIN,
        });
        break;
    }
  }, [template, templateFormat]);

  const onBackClickHandler = () => {
    navigate('../');
  };

  const onSaveClickHandler = () => {
    updateMenu({
      variables: {
        menu: {
          id: Number(id),
          template: template[templateFormat],
          templateFormat,
        },
      },
      onCompleted: data => {
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.editSuccess', {
            resource: t('menu.of', { field: 'template' }),
            context: 'male',
          })}!`,
        });
      },
      onError: error => {
        openDefaultErrorNotification(error, dispatch);
      },
    });
  };

  const onDiscardClickHandler = () => {
    if (data?.menu.templateFormat) setTemplateFormat(data.menu.templateFormat);
    if (data?.menu.template)
      setTemplate({
        ...template,
        [data.menu.templateFormat]: data.menu.template,
      });
    else resetDefaultTemplate();
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
          { label: data?.menu.name, navigateTo: '../' },
          { label: t('menuItem.editTemplate.title') },
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
              mt: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              maxWidth: '10vw',
              px: '2rem',
            }}
          >
            <Box
              sx={{
                height: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <Typography variant="h2" component="h2" sx={{ mb: '2rem' }}>
                {t('menuItem.editTemplate.actions.title')}
              </Typography>
              <Button
                variant="contained"
                color="success"
                sx={{ mb: '1rem' }}
                onClick={onSaveClickHandler}
              >
                {t('menuItem.editTemplate.actions.save')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mb: '1rem' }}
                onClick={onDiscardClickHandler}
              >
                {t('menuItem.editTemplate.actions.discard')}
              </Button>
              <Button variant="contained" color="primary" onClick={resetDefaultTemplate}>
                {t('menuItem.editTemplate.actions.useDefault')}
              </Button>
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
