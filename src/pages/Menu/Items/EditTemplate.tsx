import React from 'react';
import { Box, Button, FormControl, Link, MenuItem, Select, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { draculaInit } from '@uiw/codemirror-theme-dracula';
import { tags } from '@lezer/highlight';
import { jsonHandlebars } from '../../../utils/codemirror/json';
import { xmlHandlebars } from '../../../utils/codemirror/xml';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import MenuItemService from '../../../api/services/MenuItemService';
import Loading from '../../../components/Loading';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import CodeViewer from '../../../components/CodeViewer';
import { EnumTemplateFormat, GraphQLData, IMenu, IMenuItem, IMenuMeta } from '../../../types';
import MenuService from '../../../api/services/MenuService';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';

export const EditTemplateItems = () => {
  const { dispatch } = React.useContext(NotificationContext);

  const { id, itemId } = useParams();

  const navigate = useNavigate();

  const { t } = useTranslation();

  const [templateFormat, setTemplateFormat] = React.useState(EnumTemplateFormat.JSON);
  const [defaultTemplate, setDefaultTemplate] = React.useState({
    [EnumTemplateFormat.JSON]: '',
    [EnumTemplateFormat.XML]: '',
    [EnumTemplateFormat.PLAIN]: '',
  });
  const [template, setTemplate] = React.useState({
    [EnumTemplateFormat.JSON]: '',
    [EnumTemplateFormat.XML]: '',
    [EnumTemplateFormat.PLAIN]: '',
  });
  const [templateResult, setTemplateResult] = React.useState('');
  const [loadedInitialTemplate, setLoadedInitialTemplate] = React.useState(false);

  const [language, setLanguage] = React.useState(jsonHandlebars);

  React.useEffect(() => {
    switch (templateFormat) {
      case EnumTemplateFormat.JSON:
        setLanguage(jsonHandlebars);
        break;
      case EnumTemplateFormat.XML:
        setLanguage(xmlHandlebars());
        break;
      case EnumTemplateFormat.PLAIN:
        setLanguage(jsonHandlebars);
        break;
    }
  }, [templateFormat]);

  const { loading, error, data } = useQuery(MenuItemService.GET_MENU_ITEM, {
    variables: { id: Number(itemId), menuId: Number(id) },
  });

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  const [renderMenuItemTemplate] = useLazyQuery(MenuService.RENDER_MENU_ITEM_TEMPLATE, {
    defaultOptions: {
      variables: {
        item: {
          id: Number(itemId),
          label: data?.menuItem.label,
          order: data?.menuItem.order,
          meta: data?.menuItem.meta,
          template: template[templateFormat],
          templateFormat,
          children: [],
          parentId: data?.menuItem.parentId,
          enabled: data?.menuItem.enabled,
          startPublication: data?.menuItem.startPublication,
          endPublication: data?.menuItem.endPublication,
        },
        menu: {
          name: data?.menuItem.menu.name,
          meta: data?.menuItem.menu.meta,
          items: data?.menuItem.menu.items,
        },
      },
    },
  });

  React.useEffect(() => {
    if (!data || loadedInitialTemplate) return;
    const item = data.menuItem;
    setDefaultTemplate(item.defaultTemplate);
    if (item.templateFormat) setTemplateFormat(item.templateFormat);
    else if (item.menu.templateFormat) setTemplateFormat(item.menu.templateFormat);
    setTemplate({
      ...item.defaultTemplate,
      [item.templateFormat]: item.template,
    });
    setLoadedInitialTemplate(true);
  }, [data, loadedInitialTemplate, template]);

  React.useEffect(() => {
    if (!data) return;
    const item: GraphQLData<IMenuItem> = JSON.parse(JSON.stringify(data.menuItem));
    const getItemProperties = (item: GraphQLData<IMenuItem>) => {
      const {
        id,
        label,
        order,
        template,
        templateFormat,
        meta,
        parentId,
        enabled,
        startPublication,
        endPublication,
      } = item;
      return {
        id,
        label,
        order,
        template,
        templateFormat,
        meta,
        parentId,
        enabled,
        startPublication,
        endPublication,
      };
    };
    const getChildren = (parent: IMenuItem): IMenuItem[] => {
      const children = JSON.parse(JSON.stringify(item.menu.items))
        .filter(item => item.parentId === parent.id)
        .map((item: GraphQLData<IMenuItem>) => {
          const properties = getItemProperties(item);
          return {
            ...properties,
            children: getChildren(item),
          };
        })
        .sort((a, b) => a.order - b.order);
      return children;
    };
    const { __typename, id, ...menu } = JSON.parse(JSON.stringify(item.menu)) as GraphQLData<IMenu>;
    menu.meta = menu.meta.map((meta: GraphQLData<IMenuMeta>) => {
      const { __typename, ...rest } = meta;
      return rest;
    });
    menu.items = menu.items.map((item: GraphQLData<IMenuItem>) => getItemProperties(item));
    try {
      const properties = getItemProperties(item);
      renderMenuItemTemplate({
        variables: {
          item: {
            ...properties,
            template: template[templateFormat],
            templateFormat,
            children: getChildren(JSON.parse(JSON.stringify(item))),
          },
          menu,
        },
        onCompleted: (data: any) => {
          if (data) {
            setTemplateResult(data.renderMenuItemTemplate);
          }
        },
        onError: error => {
          openDefaultErrorNotification(error, dispatch);
          console.error(error);
        },
      });
    } catch (error) {
      console.error(error);
    }
  }, [template, templateFormat, data, itemId, renderMenuItemTemplate, dispatch]);

  const dracula = React.useMemo(
    () =>
      draculaInit({
        styles: [
          { tag: tags.variableName, color: '#ffd599' },
          { tag: tags.special(tags.variableName), color: '#e47f0c' },
          { tag: tags.special(tags.brace), color: '#ffd599' },
          { tag: tags.definitionKeyword, color: '#e47f0c' },
          { tag: tags.string, color: '#0ab20d' },
          { tag: tags.number, color: '#7ab0e6' },
          { tag: tags.bool, color: '#7ab0e6' },
        ],
      }),
    [],
  );

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
    setTemplate({
      ...template,
      [templateFormat]: defaultTemplate[templateFormat],
    });
  }, [template, templateFormat, defaultTemplate]);

  const onBackClickHandler = () => {
    navigate('../');
  };

  const onSaveClickHandler = () => {
    updateMenu({
      variables: {
        menu: {
          id: Number(id),
          items: [
            {
              action: 'UPDATE',
              id: Number(itemId),
              template: template[templateFormat],
              templateFormat,
            },
          ],
        },
      },
      onCompleted: data => {
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.editSuccess', {
            resource: t('menuItem.of', { field: 'template' }),
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
    if (data?.menuItem.templateFormat) setTemplateFormat(data.menuItem.templateFormat);
    if (data?.menuItem.template)
      setTemplate({
        ...template,
        [data.menuItem.templateFormat]: data.menuItem.template,
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
