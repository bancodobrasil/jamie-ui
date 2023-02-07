import React from 'react';
import {
  FormControlLabel,
  styled,
  Checkbox,
  TextField,
  Box,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTime } from 'luxon';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { EnumAction, IEditingNode, IMenu, IMenuMeta, INode, MenuMetaType } from '../../../types';
import { MENU_ITEM_VALIDATION } from '../../../constants';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';
import MenuService from '../../../api/services/MenuService';

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  paddingRight: '1rem',
  overflowY: 'auto',
});

enum EnumActionScreen {
  SELECTING_ACTION,
  INSERT,
  UPDATE,
  DELETE,
}

interface Props {
  id: string;
  data: { menu: IMenu };
  nodes: INode[];
  emptyEditingNode: IEditingNode;
  editingNode: IEditingNode;
  setEditingNode: (editingNode: IEditingNode) => void;
  expanded: string[];
  setExpanded: (expanded: string[]) => void;
  selected: string;
  setSelected: (selected: string) => void;
  findNodeById: (nodes: INode[], id: number) => INode | undefined;
  preview: (nodes: INode[], editingNode: IEditingNode) => INode[];
  setUpdatedMenu: (menu: IMenu) => void;
}

export const OperationScreen = ({
  id,
  data,
  nodes,
  editingNode,
  emptyEditingNode,
  expanded,
  setExpanded,
  selected,
  setSelected,
  findNodeById,
  preview,
  setEditingNode,
  setUpdatedMenu,
}: Props) => {
  const { dispatch } = React.useContext(NotificationContext);

  const { i18n, t } = useTranslation();

  const [operationScreen, setOperationScreen] = React.useState<EnumActionScreen>(
    EnumActionScreen.SELECTING_ACTION,
  );
  const [labelError, setLabelError] = React.useState<string>('');

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

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

  const handleActionChange = React.useCallback(
    (action: EnumActionScreen) => {
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
    [
      data,
      findNodeById,
      nodes,
      selected,
      t,
      expanded,
      emptyEditingNode,
      setEditingNode,
      setExpanded,
      setSelected,
    ],
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
