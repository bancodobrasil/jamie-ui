/* eslint-disable no-console */
import { TreeItem, TreeItemProps, TreeView } from '@mui/lab';
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
import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { i18n, TFunction } from 'i18next';
import { DateTime } from 'luxon';
import ErrorBoundary, { ErrorFallbackWithBreadcrumbs } from '../../../components/ErrorBoundary';
import Loading from '../../../components/Loading';
import MenuService from '../../../api/services/MenuService';
import { WrapPromise } from '../../../utils/suspense/WrapPromise';
import { IMenu, IMenuItem, IMenuItemMeta, IMenuMeta, MenuMetaType } from '../../../types';
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import { MENU_ITEM_VALIDATION } from '../../../constants';

enum EnumModified {
  INSERTING,
  UPDATING,
  DELETING,
}

interface INode extends Omit<TreeItemProps, 'nodeId' | 'children'> {
  id: string;
  order: number;
  children: INode[];
  meta: IMenuItemMeta;
  parent?: string;
  modified?: EnumModified;
}

interface IEditingNode extends INode {
  modified: EnumModified;
  original: INode;
}

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
  id: '',
  label: '',
  order: 0,
  modified: EnumModified.INSERTING,
  children: [],
  meta: {},
  original: {
    id: '',
    label: '',
    order: 0,
    modified: EnumModified.INSERTING,
    children: [],
    meta: {},
  },
};

interface Props {
  id: string;
  resource: WrapPromise<IMenu>;
  onBackClickHandler: () => void;
  t: TFunction;
  i18n: i18n;
  navigate: NavigateFunction;
}

export const PageWrapper = ({ id, resource, onBackClickHandler, t, i18n, navigate }: Props) => {
  const menu = resource.read();

  const [expanded, setExpanded] = useState<string[]>(['0']);
  const [selected, setSelected] = useState<string>('0');

  const [operationScreen, setOperationScreen] = useState<EnumActionScreen>(
    EnumActionScreen.SELECTING_ACTION,
  );

  const nodes = useMemo<INode[]>(() => {
    const getChildren = (parent: IMenuItem): INode[] => {
      if (!parent.children) return [];
      const children = parent.children.map(child => ({
        id: child.id,
        label: child.label,
        order: child.order,
        parent: parent.id,
        children: getChildren(child),
        meta: child.meta,
      }));
      return children;
    };
    const root: INode[] = menu.items.map(item => ({
      id: item.id,
      label: item.label,
      order: item.order,
      children: getChildren(item),
      parent: '0',
      meta: item.meta,
    }));
    return [
      {
        id: '0',
        label: t('menu.preview.root'),
        order: 1,
        children: root,
        meta: {},
      },
    ];
  }, [menu, t]);

  const [editingNode, setEditingNode] = useState<IEditingNode>(emptyEditingNode);
  const [labelError, setLabelError] = useState<string>('');

  const findNodeById = useCallback((nodes: INode[], id: string): INode | undefined => {
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
    if (nodes[0].id === '0' && nodes[0].children?.length === 0)
      return [{ ...nodes[0], children: [editingNode] }];
    console.log('nodes', nodes);
    console.log('editing node', editingNode);
    const nodesPreview: INode[] = [];
    const deleteChildren = (node: INode): INode[] | undefined => {
      if (!node.children) return undefined;
      return node.children.map(child => {
        const children = deleteChildren(child);
        if (children) return { ...child, children, modified: EnumModified.DELETING };
        return { ...child, modified: EnumModified.DELETING };
      });
    };
    nodes.forEach(node => {
      console.log('current node', node);
      if (node.id === editingNode.id) {
        // editing node is current node
        console.log('editing node is current node', node);
        if (editingNode.modified === EnumModified.UPDATING) {
          // editing node is updating
          console.log('editing node is updating');
          // set current node as updating
          nodesPreview.push({ ...node, modified: EnumModified.UPDATING });
        } else {
          // editing node is deleting
          console.log('editing node is deleting');
          // set current node as deleting
          nodesPreview.push({
            ...node,
            modified: EnumModified.DELETING,
            children: deleteChildren(node),
          });
        }
      } else if (node.id === editingNode.parent) {
        // current node is parent of editing node
        console.log('editing node is parent of current node', node);
        if (!node.children || node.children.length === 0) {
          // parent has no children
          console.log('parent has no children');
          // add editing node to parent children
          nodesPreview.push({
            ...node,
            children: [editingNode],
            modified: EnumModified.UPDATING,
          });
        } else {
          let children = node.children.map(child => {
            if (child.id === editingNode.id) {
              // child is editing node
              console.log('child is editing node', child);
              if (child.order === editingNode.order) {
                // child is in same position
                console.log('child is in same position');
                if (editingNode.modified === EnumModified.DELETING) {
                  // editing node is deleting
                  console.log('editing node is deleting');
                  // set child as deleting
                  return {
                    ...child,
                    modified: EnumModified.DELETING,
                    children: deleteChildren(child),
                  };
                }
                // editing node is updating
                console.log('editing node is updating');
                // set child as updating
                return { ...child, modified: EnumModified.UPDATING, label: editingNode.label };
              }
              // child is in different position
              console.log('child is in different position');
              // set child as updating and set order as editing node order
              return {
                ...child,
                modified: EnumModified.UPDATING,
                order: editingNode.order,
                label: editingNode.label,
              };
            }
            if (child.order === editingNode.order) {
              // child is in same position as editing node
              console.log('child is in same position as editing node', child);
              // set order based on existing node order diff (moving up or down)
              const diff = editingNode.order - editingNode.original.order;
              let order = diff >= 0 ? child.order - 1 : child.order + 1;
              if (editingNode.modified === EnumModified.DELETING) {
                // editing node is deleting
                console.log('editing node is deleting');
                // decrease order
                order = child.order - 1;
              }
              // set child as updating and decrease order
              return { ...child, modified: EnumModified.UPDATING, order };
            }
            if (child.order > editingNode.order) {
              // child is after editing node
              console.log('child is after editing node', child);
              // set child order and modified based on deleting or inserting
              const modified =
                editingNode.modified === EnumModified.UPDATING ? undefined : EnumModified.UPDATING;
              let { order } = child;
              if (editingNode.modified === EnumModified.DELETING) {
                order = child.order - 1;
              } else if (editingNode.modified === EnumModified.INSERTING) {
                order = child.order + 1;
              }
              // set child as updating
              return { ...child, order, modified };
            }
            // child is before editing node
            console.log('child is before editing node', child);
            return child;
          });
          if (editingNode.modified === EnumModified.INSERTING) {
            // editing node is inserting
            console.log('editing node is inserting');
            // add editing node to parent children
            children.splice(editingNode.order - 1, 0, editingNode);
          }
          children = children.sort((a, b) => a.order - b.order);
          // set parent as updating
          nodesPreview.push({ ...node, children, modified: EnumModified.UPDATING });
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
            nodesPreview.push({ ...node, children, modified: EnumModified.UPDATING });
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

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected(nodeId);
  };

  const handleInsertSubmit = async (e: React.FormEvent) => {
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
      // return;
    }
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
      // return;
    }
  };

  const handleActionChange = useCallback(
    (action: EnumActionScreen) => {
      const selectedNode = findNodeById(nodes, selected);
      if (expanded.indexOf(selectedNode.id) === -1) {
        setExpanded([...expanded, selectedNode.id]);
      }
      let original;
      switch (action) {
        case EnumActionScreen.SELECTING_ACTION:
          setEditingNode(emptyEditingNode);
          break;
        case EnumActionScreen.INSERT:
          original = {
            id: '-1',
            label: t('menu.preview.newItem', {
              order: selectedNode.children?.length
                ? selectedNode.children.length + 1
                : nodes.length + 1,
            }),
            order: selectedNode.children?.length ? selectedNode.children.length + 1 : 1,
            modified: EnumModified.INSERTING,
            parent: selectedNode.id,
            meta: menu.meta.map(m => ({ [m.name]: '' })),
          };
          setEditingNode({ ...original, original });
          setSelected('-1');
          break;
        case EnumActionScreen.UPDATE:
          if (!selectedNode || selectedNode.id === '0') {
            !selectedNode && setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            modified: EnumModified.UPDATING,
            original: selectedNode,
          });
          setSelected(selectedNode.id);
          break;
        case EnumActionScreen.DELETE:
          if (!selectedNode || selectedNode.id === '0') {
            !selectedNode && setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            modified: EnumModified.DELETING,
            original: selectedNode,
          });
          setSelected(selectedNode.id);
          break;
      }
      setOperationScreen(action);
    },
    [menu, findNodeById, nodes, selected, t, expanded],
  );

  const renderNodes = useCallback(
    (nodes: INode[]) =>
      nodes.map(node => {
        let color = 'black';
        const fontWeight = node.id === editingNode.id ? 'bold' : 'normal';
        switch (node.modified) {
          case EnumModified.INSERTING:
            color = 'green';
            break;
          case EnumModified.UPDATING:
            color = 'orange';
            break;
          case EnumModified.DELETING:
            color = 'red';
            break;
        }
        if (node.children?.length > 0) {
          return (
            <TreeItem
              key={node.id}
              nodeId={node.id}
              label={node.label}
              sx={{
                '& > .MuiTreeItem-content  > .MuiTreeItem-label': {
                  color,
                  fontWeight,
                },
              }}
            >
              {renderNodes(node.children)}
            </TreeItem>
          );
        }
        return (
          <TreeItem
            key={node.id}
            nodeId={node.id}
            label={node.label}
            sx={{
              '& .MuiTreeItem-content .MuiTreeItem-label': {
                color,
                fontWeight,
              },
            }}
          />
        );
      }),
    [editingNode.id],
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
              value={editingNode.meta[meta.name]}
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
                const m = { ...editingNode.meta, [meta.name]: e.target.value };
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
    return menu.meta.map((meta, i) => (
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
                value={findNodeById(nodes, editingNode.parent).label}
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
                  const parent = findNodeById(nodes, selected);
                  const order = parent.children ? parent.children.length + 1 : 1;
                  setEditingNode({
                    ...editingNode,
                    parent: selected,
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
                const parent = findNodeById(nodes, editingNode.parent);
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
            {menu.meta.length > 0 && <Divider sx={{ mt: '2rem' }} />}
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
              value={findNodeById(nodes, editingNode.parent).label}
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
                const parent = findNodeById(nodes, editingNode.parent);
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
            {menu.meta.length > 0 && <Divider sx={{ mt: '2rem' }} />}
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
              value={findNodeById(nodes, editingNode.parent).label}
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
              <Button variant="contained" color="success" sx={{ mt: '2rem', mr: '1rem' }}>
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

  return (
    <Box>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: menu.name, navigateTo: '../' },
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
          {menu.name}
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
            <Box sx={{ width: '100%', height: '100%', border: '1px solid black', p: '1rem' }}>
              <TreeView
                defaultExpandIcon={<ExpandMoreIcon />}
                defaultCollapseIcon={<ExpandLessIcon />}
                defaultExpanded={['0']}
                expanded={expanded}
                selected={selected}
                onNodeToggle={handleToggle}
                onNodeSelect={handleSelect}
              >
                {renderNodes(preview(nodes, editingNode))}
              </TreeView>
            </Box>
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

export const ItemsPreview = () => {
  const { i18n, t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const resource = MenuService.getMenu({ id: Number(id) });

  const onBackClickHandler = () => {
    navigate('/');
  };

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallbackWithBreadcrumbs
          message={t('common.error.service.get', { resource: t('menu.title', { count: 1 }) })}
          appBreadcrumbsProps={{
            items: [
              { label: t('application.title'), navigateTo: '/' },
              { label: t('menu.title', { count: 1 }) },
            ],
            onBack: onBackClickHandler,
          }}
        />
      }
    >
      <Suspense fallback={<Loading />}>
        <PageWrapper
          id={id}
          resource={resource}
          onBackClickHandler={onBackClickHandler}
          t={t}
          i18n={i18n}
          navigate={navigate}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
