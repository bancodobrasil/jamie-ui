import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Box, Typography, TextField, Divider, Button } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import Loading from '../../../components/Loading';
import { MENU_REVISION_VALIDATION } from '../../../constants';
import MenuRevisionService from '../../../api/services/MenuRevisionService';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { MenuRevisionsDiff } from '../../../components/Menu/Revisions';
import { menuRevisionDiff } from '../../../utils/diff/menuRevisionDiff';

const CreateRevision = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const onBackClickHandler = () => {
    navigate('/');
  };

  const { dispatch } = React.useContext(NotificationContext);

  const [description, setDescription] = React.useState('');
  const [descriptionError, setDescriptionError] = React.useState('');

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const { loading, error, data } = useQuery(MenuService.GET_MENU_REVISIONS, {
    variables: { id: Number(id) },
  });

  const [createRevision] = useMutation(MenuRevisionService.CREATE_REVISION);

  const menu: any = React.useMemo(() => {
    if (!data?.menu) return null;
    const { name, meta, items, template, templateFormat, currentRevision } = data.menu;
    const removeTypename = (arr: any[]) =>
      arr.map(item => {
        const { __typename, ...rest } = item;
        return rest;
      });
    const getChildren = (items: any[], parent: any): any[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map(item => ({
          ...item,
          children: getChildren(items, item),
        }));
      return children;
    };
    const currentMeta = meta && removeTypename(meta);
    let currentItems = items && removeTypename(items);
    currentItems = currentItems
      .map(item => ({
        ...item,
        children: getChildren(currentItems || [], item),
      }))
      .filter(item => !item.parentId);

    if (!currentRevision)
      return {
        name,
        meta: currentMeta,
        items: currentItems,
        template,
        templateFormat,
      };

    const snapshot = { ...currentRevision.snapshot };
    snapshot.items = snapshot.items
      ?.map(item => ({
        ...item,
        children: getChildren(snapshot.items || [], item),
      }))
      .filter(item => !item.parentId);

    return {
      name,
      meta: currentMeta,
      items: currentItems,
      template,
      templateFormat,
      currentRevision: { ...currentRevision, snapshot },
    };
  }, [data]);

  const menuDiff: any = React.useMemo(() => {
    if (!menu) return null;
    if (!menu.currentRevision) return menu;
    let currentMeta = [...menu.meta];
    const { snapshot } = menu.currentRevision;
    const updatedMeta = snapshot.meta?.map((item: any, index: number) => {
      const current = currentMeta?.[index];
      if (!current || item.id !== current.id || item.type !== current.type) {
        const updatedItem = currentMeta?.find(i => i.id === item.id && i.type === item.type);
        if (updatedItem) return updatedItem;
        return null;
      }
      return current;
    });
    currentMeta = [...(updatedMeta || []), ...(currentMeta || [])].filter((item, index, arr) => {
      if (item === null) return true;
      return arr.findIndex(i => i?.id === item.id) === index;
    });
    const setUpdatedItems = (snapshotItems: any[], currentItems: any[]) =>
      snapshotItems?.map((item: any, index: number) => {
        const current = currentItems?.[index];
        if (!current || item.id !== current.id) {
          const updatedItem = currentItems?.find(i => i.id === item.id);
          if (updatedItem)
            return {
              ...updatedItem,
              children: setUpdatedItems(item.children, updatedItem.children),
            };
          return null;
        }
        return { ...current, children: setUpdatedItems(item.children, current.children) };
      });
    let currentItems = [...menu.items];
    const updatedItems = setUpdatedItems(snapshot.items, currentItems);
    currentItems = [...(currentItems || []), ...(updatedItems || [])];
    currentItems = currentItems.filter((item, index, arr) => {
      if (item === null) return true;
      return arr.findIndex(i => i?.id === item.id) === index;
    });
    const { name, template, templateFormat } = menu;
    const diff = menuRevisionDiff(snapshot, {
      name,
      meta: currentMeta,
      items: currentItems,
      template,
      templateFormat,
    });
    return diff;
  }, [menu]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let tmpDescriptionError = '';
    if (description.length < MENU_REVISION_VALIDATION.DESCRIPTION_MIN_LENGTH) {
      tmpDescriptionError = t('form.validation.min', {
        field: t('menu.fields.name'),
        min: MENU_REVISION_VALIDATION.DESCRIPTION_MIN_LENGTH,
      });
    } else if (description.length > MENU_REVISION_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      tmpDescriptionError = t('form.validation.max', {
        field: t('menu.fields.name'),
        max: MENU_REVISION_VALIDATION.DESCRIPTION_MAX_LENGTH,
      });
    }
    if (tmpDescriptionError) {
      setDescriptionError(tmpDescriptionError);
      return;
    }
    setLoadingSubmit(true);
    createRevision({
      variables: {
        input: {
          menuId: Number(id),
          description,
          setAsCurrent: true,
        },
      },
      onCompleted: data => {
        setLoadingSubmit(false);
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.createSuccess', {
            resource: t('menuRevision.title', { count: 1 }),
            context: 'male',
          })}!`,
        });
        navigate(`/menus/${id}`);
      },
      onError: error => {
        setLoadingSubmit(false);
        openDefaultErrorNotification(error, dispatch);
      },
    });
  };

  if (error)
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

  if (loading) return <Loading />;

  return (
    <Box>
      <Helmet>
        <title>{t('menuRevision.create.title')}</title>
      </Helmet>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../edit' },
          { label: t('menuRevision.create.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Typography variant="h1" component="h1" sx={{ my: '1rem' }}>
        {t('menuRevision.create.title')}
      </Typography>
      <Typography variant="h2" component="h2" sx={{ my: '0.5rem' }}>
        {t('menuRevision.create.reviewChanges.title')}
      </Typography>
      <Typography variant="body1" component="p" sx={{ my: '0.5rem' }}>
        {t('menuRevision.create.reviewChanges.description')}
      </Typography>
      <MenuRevisionsDiff id={id} diff={menuDiff} snapshot={menu.currentRevision?.snapshot} />
      <Divider />
      {menuDiff && Object.keys(menuDiff).length > 0 ? (
        <Box className="flex flex-col py-4" component="form" onSubmit={handleFormSubmit}>
          <Typography variant="h4" component="h4">
            {t('common.commentary')}:
          </Typography>
          <TextField
            id="description"
            label={t('menuRevision.fields.description')}
            placeholder={t('menuRevision.create.placeholders.description')}
            required
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              setDescriptionError('');
              setDescription(value);
            }}
            inputProps={{
              maxLength: MENU_REVISION_VALIDATION.DESCRIPTION_MAX_LENGTH,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!descriptionError}
            helperText={descriptionError}
            sx={{ width: '20rem', my: '1rem' }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loadingSubmit}
            sx={{
              width: 'fit-content',
            }}
          >
            {t('menuRevision.create.title')}
          </Button>
        </Box>
      ) : (
        <Box className="flex flex-col py-4">
          <Typography variant="h6" component="h6">
            <i className="text-gray-400">{t('menuRevision.create.noChanges')}</i>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/menus/${id}`)}
            sx={{
              width: 'fit-content',
              mt: '1rem',
            }}
          >
            {t('buttons.back')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CreateRevision;
