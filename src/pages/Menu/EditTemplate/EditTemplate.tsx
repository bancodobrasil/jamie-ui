import React from 'react';
import { Box, Button, FormControl, Link, MenuItem, Select, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import Handlebars from 'handlebars/dist/handlebars';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import MenuService from '../../../api/services/MenuService';
import Loading from '../../../components/Loading';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import CodeViewer from '../../../components/CodeViewer';
import {
  EnumTemplateFormat,
  GraphQLData,
  IMenu,
  IMenuItem,
  IMenuItemMeta,
  IMenuMeta,
} from '../../../types';
import MenuInitialTemplate from '../../../utils/template/MenuInitialTemplate';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import TemplateHelpers from '../../../utils/template/TemplateHelpers';

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

  const [language, setLanguage] = React.useState(json);

  React.useEffect(() => {
    switch (templateFormat) {
      case EnumTemplateFormat.JSON:
        setLanguage(json);
        break;
      case EnumTemplateFormat.XML:
        setLanguage(xml());
        break;
      case EnumTemplateFormat.PLAIN:
        setLanguage(json);
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
    Handlebars.registerHelper(TemplateHelpers.logicOperators);
    Handlebars.registerHelper('length', TemplateHelpers.getLength);
    Handlebars.registerHelper('json', TemplateHelpers.json);
    Handlebars.registerHelper('renderItemsJSON', TemplateHelpers.renderItemsJSON);
    Handlebars.registerHelper('renderItemsXML', TemplateHelpers.renderItemsXML);
    const { menu }: { menu: GraphQLData<IMenu> } = data;
    let items: IMenuItem[] = menu.items || [];
    const getItemMeta = (meta: IMenuItemMeta): Record<string, unknown> => {
      const result: Record<string, unknown> = {};
      if (!meta) return result;
      menu.meta?.forEach((item: IMenuMeta) => {
        if (item.enabled && meta[item.id]) {
          result[item.name] = meta[item.id];
        }
      });
      return result;
    };
    const getChildren = (parent: IMenuItem): IMenuItem[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map((item: GraphQLData<IMenuItem>) => {
          const { __typename, template, templateFormat, ...rest } = item;
          const meta = getItemMeta(rest.meta);
          let formattedTemplate = template;
          if (template) {
            formattedTemplate = Handlebars.compile(template)({
              ...rest,
              meta,
              children: getChildren(item),
              templateFormat,
            });
            if (templateFormat === EnumTemplateFormat.JSON) {
              formattedTemplate = JSON.parse(formattedTemplate);
            }
          }
          return {
            ...rest,
            meta,
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
        .map((item: GraphQLData<IMenuItem>) => {
          const { __typename, template, templateFormat, ...rest } = item;
          const meta = getItemMeta(rest.meta);
          let formattedTemplate = template;
          if (template) {
            formattedTemplate = Handlebars.compile(template)({
              ...rest,
              meta,
              children: getChildren(item),
              templateFormat,
            });
            if (templateFormat === EnumTemplateFormat.JSON) {
              formattedTemplate = JSON.parse(formattedTemplate);
            }
          }
          return {
            ...rest,
            meta,
            children: getChildren(item),
            template: formattedTemplate,
            templateFormat,
          };
        })
        .filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    try {
      const { __typename, template: menuTemplate, ...rest } = menu;
      rest.meta = rest.meta.map((meta: GraphQLData<IMenuMeta>) => {
        const { __typename, ...rest } = meta;
        return rest;
      });
      const result = Handlebars.compile(template[templateFormat])({
        ...rest,
        items,
      });
      if (templateFormat === EnumTemplateFormat.JSON) {
        setTemplateResult(JSON.stringify(JSON.parse(result), null, 2));
        return;
      }
      setTemplateResult(result);
    } catch (error) {
      // empty
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
                      href="https://handlebarsjs.com/"
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
