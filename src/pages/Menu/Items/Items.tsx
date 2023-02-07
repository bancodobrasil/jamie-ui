/* eslint-disable no-console */
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  styled,
} from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { useMutation, useQuery } from '@apollo/client';
import Loading from '../../../components/Loading';
import MenuService from '../../../api/services/MenuService';
import {
  EnumAction,
  IEditingNode,
  IMenu,
  IMenuItem,
  IMenuMeta,
  INode,
  MenuMetaType,
} from '../../../types';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import { MENU_ITEM_VALIDATION } from '../../../constants';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import { NodeTreeView } from '../../../components/Menu/Items';

enum EnumActionScreen {
  SELECTING_ACTION,
  INSERT,
  UPDATE,
  DELETE,
}

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  paddingRight: '1rem',
  overflowY: 'auto',
});

const emptyEditingNode: IEditingNode = {
  id: 0,
  label: '',
  order: 0,
  action: EnumAction.CREATE,
  parentId: 0,
  children: [],
  meta: {},
  original: {
    id: 0,
    label: '',
    order: 0,
    action: EnumAction.CREATE,
    parentId: 0,
    children: [],
    meta: {},
  },
};

export const ItemsPreview = () => {
  const { i18n, t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const { dispatch } = React.useContext(NotificationContext);

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);
  const [updatedMenu, setUpdatedMenu] = useState<IMenu>();

  const [expanded, setExpanded] = useState<string[]>(['0']);
  const [selected, setSelected] = useState<string>('0');

  const [operationScreen, setOperationScreen] = useState<EnumActionScreen>(
    EnumActionScreen.SELECTING_ACTION,
  );

  const nodes = useMemo<INode[]>(() => {
    const items: IMenuItem[] = updatedMenu?.items || data?.menu.items || [];
    console.log('items', items);
    const getChildren = (parent: IMenuItem): INode[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map((item: IMenuItem & { __typename?: string }) => {
          const { __typename, ...rest } = item;
          return {
            ...rest,
            children: getChildren(item),
          };
        })
        .sort((a, b) => a.order - b.order);
      return children;
    };
    const root: INode[] =
      items
        .map(item => ({
          id: item.id,
          label: item.label,
          order: item.order,
          children: getChildren(item),
          parentId: item.parentId || 0,
          meta: item.meta,
        }))
        .filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    console.log('root', root);
    return [
      {
        id: 0,
        label: t('menu.preview.root'),
        order: 1,
        children: root,
        meta: {},
      },
    ];
  }, [updatedMenu, data?.menu, t]);

  const [editingNode, setEditingNode] = useState<IEditingNode>(emptyEditingNode);
  const [labelError, setLabelError] = useState<string>('');

  const findNodeById = useCallback((nodes: INode[], id: number): INode | undefined => {
    console.log('find node by id', id, nodes);
    const node = nodes.find(node => node.id === id);
    if (node) return node;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children?.length > 0) {
        const node = findNodeById(nodes[i].children, id);
        if (node) return node;
      }
    }
    return undefined;
  }, []);

  const preview = useCallback((nodes: INode[], editingNode: IEditingNode): INode[] => {
    if (!editingNode.id) return nodes;
    if (nodes[0].id === 0 && nodes[0].children?.length === 0)
      return [{ ...nodes[0], children: [editingNode] }];
    console.log('nodes', nodes);
    console.log('editing node', editingNode);
    const nodesPreview: INode[] = [];
    const deleteChildren = (node: INode): INode[] | undefined => {
      if (!node.children) return undefined;
      return node.children.map(child => {
        const children = deleteChildren(child);
        if (children) return { ...child, children, action: EnumAction.DELETE };
        return { ...child, action: EnumAction.DELETE };
      });
    };
    nodes.forEach(node => {
      console.log('current node', node);
      if (node.id === editingNode.id) {
        // editing node is current node
        console.log('editing node is current node', node);
        if (editingNode.action === EnumAction.UPDATE) {
          // editing node is UPDATE
          console.log('editing node is UPDATE');
          // set current node as UPDATE
          nodesPreview.push({ ...node, action: EnumAction.UPDATE });
        } else {
          // editing node is DELETE
          console.log('editing node is DELETE');
          // set current node as DELETE
          nodesPreview.push({
            ...node,
            action: EnumAction.DELETE,
            children: deleteChildren(node),
          });
        }
      } else if (node.id === editingNode.parentId) {
        // current node is parent of editing node
        console.log('editing node is parent of current node', node);
        if (!node.children || node.children.length === 0) {
          // parent has no children
          console.log('parent has no children');
          // add editing node to parent children
          nodesPreview.push({
            ...node,
            children: [editingNode],
            action: EnumAction.UPDATE,
          });
        } else {
          let children = node.children.map(child => {
            if (child.id === editingNode.id) {
              // child is editing node
              console.log('child is editing node', child);
              if (child.order === editingNode.order) {
                // child is in same position
                console.log('child is in same position');
                if (editingNode.action === EnumAction.DELETE) {
                  // editing node is DELETE
                  console.log('editing node is DELETE');
                  // set child as DELETE
                  return {
                    ...child,
                    action: EnumAction.DELETE,
                    children: deleteChildren(child),
                  };
                }
                // editing node is UPDATE
                console.log('editing node is UPDATE');
                // set child as UPDATE
                return { ...child, action: EnumAction.UPDATE, label: editingNode.label };
              }
              // child is in different position
              console.log('child is in different position');
              // set child as UPDATE and set order as editing node order
              return {
                ...child,
                action: EnumAction.UPDATE,
                order: editingNode.order,
                label: editingNode.label,
              };
            }
            // child is not editing node
            if (child.order === editingNode.order) {
              // child is in same position as editing node
              console.log('child is in same position as editing node', child);
              // set order based on existing node order diff (moving up or down)
              const diff = editingNode.order - editingNode.original.order;
              let order = diff >= 0 ? child.order - 1 : child.order + 1;
              if (editingNode.action === EnumAction.DELETE) {
                // editing node is DELETE
                console.log('editing node is DELETE');
                // decrease order
                order = child.order - 1;
              }
              // set child as UPDATE and decrease order
              return { ...child, action: EnumAction.UPDATE, order };
            }
            if (child.order > editingNode.order) {
              // child is after editing node
              console.log('child is after editing node', child);
              // set child as UPDATE
              let action = EnumAction.UPDATE;
              let { order } = child;
              if (editingNode.action === EnumAction.UPDATE) {
                if (child.order < editingNode.original.order) {
                  // child order is less than editing node original order
                  // increase child order
                  order += 1;
                } else {
                  // child order is greater than editing node original order
                  // keep child order as is and set action as undefined
                  action = undefined;
                }
              } else if (editingNode.action === EnumAction.DELETE) {
                order -= 1;
              } else if (editingNode.action === EnumAction.CREATE) {
                order += 1;
              }
              return { ...child, order, action };
            }
            // child is before editing node
            console.log('child is before editing node', child);
            if (
              editingNode.action === EnumAction.UPDATE &&
              child.order > editingNode.original.order
            ) {
              // child order is greater than editing node original order
              // decrease child order
              return { ...child, action: EnumAction.UPDATE, order: child.order - 1 };
            }
            return child;
          });
          if (editingNode.action === EnumAction.CREATE) {
            // editing node is CREATE
            console.log('editing node is CREATE');
            // add editing node to parent children
            children.splice(editingNode.order - 1, 0, editingNode);
          }
          children = children.sort((a, b) => a.order - b.order);
          // set parent as UPDATE
          nodesPreview.push({ ...node, children, action: EnumAction.UPDATE });
        }
      } else {
        // current node is not parent of editing node
        console.log('current node is not parent of editing node', node);
        if (node.children?.length > 0) {
          // current node has children
          console.log('current node has children', node);
          // add current node to preview
          const children = preview(node.children, editingNode);
          if (JSON.stringify(children) !== JSON.stringify(node.children)) {
            nodesPreview.push({ ...node, children, action: EnumAction.UPDATE });
          } else {
            // children has no changes
            console.log('children has no changes');
            // add current node to preview
            nodesPreview.push(node);
          }
        } else {
          // current node has no children
          console.log('current node has no children');
          // add current node to preview
          nodesPreview.push(node);
        }
      }
    });
    console.log('nodes preview', nodesPreview);
    return nodesPreview;
  }, []);

  const onBackClickHandler = () => {
    navigate('/');
  };

  const handleUpdate = () => {
    const formatNodes = (nodes: INode[]) =>
      nodes
        .map(node => {
          const { id, children, original, parentId, ...rest } = node;
          return {
            ...rest,
            children: children && formatNodes(children),
            id: id === -1 ? undefined : id,
          };
        })
        .filter(node => !!node.action);

    const items = formatNodes(preview(nodes, editingNode)[0].children).map(node => {
      const id = node.id === -1 ? undefined : node.id;
      return {
        ...node,
        id,
      };
    });

    console.log('handleUpdate items', items);

    updateMenu({
      variables: { menu: { id: Number(id), items } },
      onCompleted: data => {
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.editSuccess', {
            resource: t('menu.title', { count: 1 }),
            context: 'male',
          })}!`,
        });
        console.log('data', data);
        setUpdatedMenu(data.updateMenu);
        setEditingNode(emptyEditingNode);
        setOperationScreen(EnumActionScreen.SELECTING_ACTION);
      },
      onError: error => {
        openDefaultErrorNotification(error, dispatch);
      },
    });
  };

  const handleInsertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let tmpLabelError = '';
    if (editingNode.label.toString().length < MENU_ITEM_VALIDATION.LABEL_MIN_LENGTH) {
      tmpLabelError = t('form.validation.min', {
        field: t('menu.fields.name'),
        min: MENU_ITEM_VALIDATION.LABEL_MIN_LENGTH,
      });
    } else if (editingNode.label.toString().length > MENU_ITEM_VALIDATION.LABEL_MAX_LENGTH) {
      tmpLabelError = t('form.validation.max', {
        field: t('menu.fields.name'),
        max: MENU_ITEM_VALIDATION.LABEL_MAX_LENGTH,
      });
    }
    if (tmpLabelError) {
      setLabelError(tmpLabelError);
      return;
    }

    handleUpdate();
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let tmpLabelError = '';
    if (editingNode.label.toString().length < MENU_ITEM_VALIDATION.LABEL_MIN_LENGTH) {
      tmpLabelError = t('form.validation.min', {
        field: t('menu.fields.name'),
        min: MENU_ITEM_VALIDATION.LABEL_MIN_LENGTH,
      });
    } else if (editingNode.label.toString().length > MENU_ITEM_VALIDATION.LABEL_MAX_LENGTH) {
      tmpLabelError = t('form.validation.max', {
        field: t('menu.fields.name'),
        max: MENU_ITEM_VALIDATION.LABEL_MAX_LENGTH,
      });
    }
    if (tmpLabelError) {
      setLabelError(tmpLabelError);
    }

    handleUpdate();
  };

  const handleActionChange = useCallback(
    (action: EnumActionScreen) => {
      console.log('handleActionChange', action, selected, data);
      const selectedNode = findNodeById(nodes, Number(selected));
      if (expanded.indexOf(selectedNode.id.toString()) === -1) {
        setExpanded([...expanded, selectedNode.id.toString()]);
      }
      let original;
      const meta = {};
      switch (action) {
        case EnumActionScreen.SELECTING_ACTION:
          setEditingNode(emptyEditingNode);
          break;
        case EnumActionScreen.INSERT:
          data?.menu.meta.forEach(m => {
            meta[m.name] = '';
          });
          original = {
            id: -1,
            label: t('menu.preview.newItem', {
              order: selectedNode.children?.length ? selectedNode.children.length + 1 : 1,
            }),
            order: selectedNode.children?.length ? selectedNode.children.length + 1 : 1,
            action: EnumAction.CREATE,
            parentId: selectedNode.id,
            meta,
          };
          console.log(original);
          setEditingNode({ ...original, original });
          setSelected('-1');
          break;
        case EnumActionScreen.UPDATE:
          if (!selectedNode || selectedNode.id === 0) {
            !selectedNode && setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            action: EnumAction.UPDATE,
            original: selectedNode,
          });
          setSelected(selectedNode.id.toString());
          break;
        case EnumActionScreen.DELETE:
          if (!selectedNode || selectedNode.id === 0) {
            !selectedNode && setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            action: EnumAction.DELETE,
            original: selectedNode,
          });
          setSelected(selectedNode.id.toString());
          break;
      }
      setOperationScreen(action);
    },
    [data, findNodeById, nodes, selected, t, expanded],
  );

  const renderMeta = () => {
    const renderInput = (meta: IMenuMeta) => {
      switch (meta.type) {
        case MenuMetaType.BOOLEAN:
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingNode.meta[meta.name] as boolean}
                  onChange={e => {
                    setEditingNode({
                      ...editingNode,
                      meta: {
                        ...editingNode.meta,
                        [meta.name]: e.target.checked,
                      },
                    });
                  }}
                />
              }
              label={meta.name}
              sx={{ mt: '1.25rem' }}
            />
          );
        case MenuMetaType.NUMBER:
          return (
            <TextField
              type="number"
              label={meta.name}
              InputLabelProps={{ shrink: true }}
              value={editingNode.meta[meta.name] || ''}
              required={meta.required}
              onChange={e => {
                setEditingNode({
                  ...editingNode,
                  meta: {
                    ...editingNode.meta,
                    [meta.name]: e.target.value,
                  },
                });
              }}
              placeholder={t('menu.preview.inputs.meta.placeholder', { meta: meta.name })}
              sx={{ mt: '1.25rem' }}
            />
          );
        case MenuMetaType.TEXT:
          return (
            <TextField
              type="text"
              label={meta.name}
              InputLabelProps={{ shrink: true }}
              value={editingNode.meta[meta.name] || ''}
              required={meta.required}
              onChange={e => {
                console.log('Editing node', editingNode);
                const m = { ...editingNode.meta, [meta.name]: e.target.value };
                console.log('m', m);
                setEditingNode({ ...editingNode, meta: m });
              }}
              placeholder={t('menu.preview.inputs.meta.placeholder', { meta: meta.name })}
              sx={{ mt: '1.25rem' }}
            />
          );
        case MenuMetaType.DATE:
          return (
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DatePicker
                label={meta.name}
                value={editingNode.meta[meta.name] || ''}
                onChange={date => {
                  setEditingNode({
                    ...editingNode,
                    meta: {
                      ...editingNode.meta,
                      [meta.name]: date,
                    },
                  });
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    required={meta.required}
                    error={!!editingNode.meta[meta.name] && params.error}
                    inputProps={{
                      ...params.inputProps,
                      placeholder: `${t('common.example')}: ${DateTime.now()
                        .plus({ days: 5 })
                        .setLocale(i18n.language)
                        .toLocaleString()}`,
                    }}
                    sx={{ mt: '1.25rem' }}
                  />
                )}
              />
            </LocalizationProvider>
          );
      }
    };
    return data?.menu.meta.map((meta, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderInput(meta)}
      </Box>
    ));
  };
  const renderOperationScreen = () => {
    switch (operationScreen) {
      case EnumActionScreen.SELECTING_ACTION:
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
                mb: '1rem',
              }}
            >
              {t('menu.preview.actions.title')}
            </Typography>
            <Box
              sx={{
                my: '2rem',
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                sx={{ color: 'green' }}
                variant="outlined"
                color="success"
                onClick={() => handleActionChange(EnumActionScreen.INSERT)}
              >
                <AddIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    lineHeight: '0.75rem',
                    letterSpacing: '0.18px',
                    color: 'green',
                    ml: '0.5rem',
                  }}
                >
                  {t('buttons.insert')}
                </Typography>
              </Button>
              <Button
                sx={{ color: 'orange' }}
                variant="outlined"
                color="warning"
                disabled={!selected}
                onClick={() => handleActionChange(EnumActionScreen.UPDATE)}
              >
                <EditIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    lineHeight: '0.75rem',
                    letterSpacing: '0.18px',
                    color: selected ? 'orange' : 'grey',
                    ml: '0.5rem',
                  }}
                >
                  {t('buttons.edit')}
                </Typography>
              </Button>
              <Button
                sx={{ color: 'red' }}
                variant="outlined"
                color="error"
                disabled={!selected}
                onClick={() => handleActionChange(EnumActionScreen.DELETE)}
              >
                <DeleteIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    lineHeight: '0.75rem',
                    letterSpacing: '0.18px',
                    color: selected ? 'red' : 'grey',
                    ml: '0.5rem',
                  }}
                >
                  {t('buttons.delete')}
                </Typography>
              </Button>
            </Box>
          </Box>
        );
      case EnumActionScreen.INSERT:
        return (
          <Form onSubmit={handleInsertSubmit}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {t('menu.preview.actions.insert')}
            </Typography>
            <Box
              sx={{
                mt: '2rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TextField
                type="text"
                label={t('menu.preview.parent')}
                value={findNodeById(nodes, editingNode.parentId).label}
                sx={{
                  width: '100%',
                }}
                contentEditable={false}
              />
              <Button
                variant="outlined"
                color="primary"
                sx={{ ml: '0.5rem' }}
                disabled={nodes.length === 0}
                onClick={() => {
                  const parent = findNodeById(nodes, Number(selected));
                  const order = parent.children ? parent.children.length + 1 : 1;
                  setEditingNode({
                    ...editingNode,
                    parentId: Number(selected),
                    order,
                    label: t('menu.preview.newItem', { order }),
                  });
                }}
              >
                {t('menu.preview.buttons.selectParent')}
              </Button>
            </Box>
            <TextField
              type="text"
              label={t('menu.preview.inputs.name.label')}
              InputLabelProps={{ shrink: true }}
              value={editingNode.label}
              onChange={e => {
                setLabelError('');
                setEditingNode({ ...editingNode, label: e.target.value });
              }}
              placeholder={t('menu.preview.inputs.name.placeholder')}
              error={!!labelError}
              helperText={labelError}
              required
              inputProps={{
                maxLength: MENU_ITEM_VALIDATION.LABEL_MAX_LENGTH,
              }}
              sx={{
                mt: '2rem',
                width: '100%',
              }}
            />
            <TextField
              type="number"
              label={t('menu.preview.inputs.order.label')}
              InputLabelProps={{ shrink: true }}
              value={editingNode.order}
              onChange={e => {
                const parent = findNodeById(nodes, editingNode.parentId);
                const order = Math.min(
                  Math.max(Number(e.target.value), 1),
                  parent.children?.length ? parent.children.length + 1 : 1,
                );
                if (order === editingNode.order) return;
                setEditingNode({
                  ...editingNode,
                  order,
                });
              }}
              sx={{
                mt: '2rem',
                width: '6rem',
              }}
            />
            <Divider sx={{ mt: '1.5rem' }} />
            {renderMeta()}
            {data?.menu.meta.length > 0 && <Divider sx={{ mt: '2rem' }} />}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                color="success"
                sx={{ mt: '2rem', mr: '1rem' }}
                type="submit"
              >
                {t('buttons.save')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: '2rem' }}
                onClick={() => handleActionChange(EnumActionScreen.SELECTING_ACTION)}
              >
                {t('buttons.discard')}
              </Button>
            </Box>
          </Form>
        );
      case EnumActionScreen.UPDATE:
        return (
          <Form onSubmit={handleUpdateSubmit}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {t('menu.preview.actions.edit')}
            </Typography>
            <TextField
              type="text"
              label={t('menu.preview.parent')}
              value={findNodeById(nodes, editingNode.parentId).label}
              sx={{
                width: '100%',
                mt: '2rem',
              }}
              contentEditable={false}
            />
            <TextField
              type="text"
              label={t('menu.preview.inputs.name.label')}
              InputLabelProps={{ shrink: true }}
              value={editingNode.label}
              onChange={e => {
                setLabelError('');
                setEditingNode({ ...editingNode, label: e.target.value });
              }}
              placeholder={t('menu.preview.inputs.name.placeholder')}
              error={!!labelError}
              helperText={labelError}
              required
              inputProps={{
                maxLength: MENU_ITEM_VALIDATION.LABEL_MAX_LENGTH,
              }}
              sx={{
                mt: '2rem',
                width: '100%',
              }}
            />
            <TextField
              type="number"
              label={t('menu.preview.inputs.order.label')}
              InputLabelProps={{ shrink: true }}
              value={editingNode.order}
              onChange={e => {
                const parent = findNodeById(nodes, editingNode.parentId);
                const order = Math.min(
                  Math.max(Number(e.target.value), 1),
                  parent.children?.length ? parent.children.length : 1,
                );
                if (order === editingNode.order) return;
                setEditingNode({
                  ...editingNode,
                  order,
                });
              }}
              sx={{
                mt: '2rem',
                width: '6rem',
              }}
            />
            <Divider sx={{ mt: '1.5rem' }} />
            {renderMeta()}
            {data?.menu.meta.length > 0 && <Divider sx={{ mt: '2rem' }} />}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                color="success"
                sx={{ mt: '2rem', mr: '1rem' }}
                type="submit"
              >
                {t('buttons.save')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: '2rem' }}
                onClick={() => handleActionChange(EnumActionScreen.SELECTING_ACTION)}
              >
                {t('buttons.discard')}
              </Button>
            </Box>
          </Form>
        );
      case EnumActionScreen.DELETE:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', pr: '1rem' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {t('menu.preview.actions.delete')}
            </Typography>
            <TextField
              type="text"
              label={t('menu.preview.parent')}
              value={findNodeById(nodes, editingNode.parentId).label}
              sx={{
                width: '100%',
                mt: '2rem',
              }}
              contentEditable={false}
            />
            <TextField
              type="text"
              label={t('menu.preview.inputs.name.label')}
              InputLabelProps={{ shrink: true }}
              value={editingNode.label}
              placeholder={t('menu.preview.inputs.name.placeholder')}
              contentEditable={false}
              sx={{
                mt: '2rem',
                width: '100%',
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                color="success"
                sx={{ mt: '2rem', mr: '1rem' }}
                onClick={handleUpdate}
              >
                {t('buttons.save')}
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: '2rem' }}
                onClick={() => handleActionChange(EnumActionScreen.SELECTING_ACTION)}
              >
                {t('buttons.discard')}
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 1,
            field: t('menu.title', { count: 1 }),
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
          { label: t('menu.preview.title') },
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
          sx={{
            fontWeight: 700,
            fontSize: '3rem',
            lineHeight: '3rem',
            letterSpacing: '0.18px',
            mb: '2rem',
          }}
        >
          {data?.menu.name}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: '2rem',
                width: '100%',
              }}
            >
              <WidgetsIcon />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: '2rem',
                  lineHeight: '2rem',
                  letterSpacing: '0.18px',
                  ml: '0.5rem',
                  pb: '5px',
                }}
              >
                {t('menu.preview.root')}
              </Typography>
            </Box>
            <NodeTreeView
              nodes={nodes}
              editingNode={editingNode}
              expanded={expanded}
              setExpanded={setExpanded}
              selected={selected}
              setSelected={setSelected}
              preview={preview}
            />
          </Box>

          <div
            style={{ width: '1px', height: '100%', border: '1px solid black', margin: '0 50px' }}
          />
          {renderOperationScreen()}
        </Box>
      </Box>
    </Box>
  );
};
