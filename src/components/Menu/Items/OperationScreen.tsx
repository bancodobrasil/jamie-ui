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
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import { DateTime } from 'luxon';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  EnumInputAction,
  IEditingNode,
  IMenu,
  IMenuMeta,
  INode,
  MenuMetaType,
} from '../../../types';
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
  paddingBottom: '1rem',
  overflowY: 'auto',
});

enum EnumInputActionScreen {
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

  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const [operationScreen, setOperationScreen] = React.useState<EnumInputActionScreen>(
    EnumInputActionScreen.SELECTING_ACTION,
  );
  const [labelError, setLabelError] = React.useState<string>('');

  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  const handleUpdate = () => {
    const formatNodes = (nodes: INode[]) =>
      nodes
        .map(node => {
          const { id, children, original, parentId, ...rest } = node;
          const meta = Object.keys(rest.meta).reduce((acc, key) => {
            const meta = rest.meta[key];
            if (meta == null || meta === '') {
              return acc;
            }
            return {
              ...acc,
              [key]: meta,
            };
          }, {});
          const startPublication = rest.startPublication?.isValid
            ? rest.startPublication.toISO()
            : null;
          const endPublication = rest.endPublication?.isValid ? rest.endPublication.toISO() : null;
          return {
            ...rest,
            startPublication,
            endPublication,
            meta,
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
        setOperationScreen(EnumInputActionScreen.SELECTING_ACTION);
        setEditingNode(emptyEditingNode);
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
    (action: EnumInputActionScreen) => {
      const selectedNode = findNodeById(nodes, Number(selected));
      if (expanded.indexOf(selectedNode.id.toString()) === -1) {
        setExpanded([...expanded, selectedNode.id.toString()]);
      }
      let node: INode;
      const meta = {};
      switch (action) {
        case EnumInputActionScreen.SELECTING_ACTION:
          setEditingNode(emptyEditingNode);
          break;
        case EnumInputActionScreen.INSERT:
          data?.menu.meta.forEach(m => {
            switch (m.type) {
              case MenuMetaType.TEXT:
              case MenuMetaType.NUMBER:
              case MenuMetaType.DATE:
                meta[m.name] = m.defaultValue || '';
                break;
              case MenuMetaType.BOOLEAN:
                meta[m.name] = m.defaultValue || false;
                break;
            }
          });
          node = {
            id: -1,
            label: t('menu.preview.newItem', {
              order: selectedNode.children?.length ? selectedNode.children.length + 1 : 1,
            }),
            order: selectedNode.children?.length ? selectedNode.children.length + 1 : 1,
            parentId: selectedNode.id,
            meta,
            enabled: true,
            children: [],
            startPublication: null,
            endPublication: null,
          };
          setEditingNode({ ...node, action: EnumInputAction.CREATE, original: node });
          setSelected('-1');
          break;
        case EnumInputActionScreen.UPDATE:
          if (!selectedNode || selectedNode.id === 0) {
            !selectedNode && setSelected('');
            return;
          }
          data?.menu.meta.forEach(m => {
            const defaultValue = selectedNode.meta[m.id] || m.defaultValue;
            switch (m.type) {
              case MenuMetaType.TEXT:
              case MenuMetaType.NUMBER:
              case MenuMetaType.DATE:
                meta[m.name] = defaultValue || '';
                break;
              case MenuMetaType.BOOLEAN:
                meta[m.name] = defaultValue || false;
                break;
            }
          });
          setEditingNode({
            ...selectedNode,
            meta,
            action: EnumInputAction.UPDATE,
            original: selectedNode,
          });
          setSelected(selectedNode.id.toString());
          break;
        case EnumInputActionScreen.DELETE:
          if (!selectedNode || selectedNode.id === 0) {
            !selectedNode && setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            action: EnumInputAction.DELETE,
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
              value={editingNode.meta[meta.name]}
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
                value={editingNode.meta[meta.name]}
                onChange={(date: DateTime) => {
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
    return data?.menu.meta
      .filter(meta => meta.enabled)
      .sort((a, b) => a.order - b.order)
      .map((meta, i) => (
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
    case EnumInputActionScreen.SELECTING_ACTION:
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
              onClick={() => handleActionChange(EnumInputActionScreen.INSERT)}
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
              disabled={!selected || selected === '0'}
              onClick={() => handleActionChange(EnumInputActionScreen.UPDATE)}
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
              disabled={!selected || selected === '0'}
              onClick={() => handleActionChange(EnumInputActionScreen.DELETE)}
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
          <Button
            variant="outlined"
            sx={{ mt: '1rem' }}
            onClick={() => navigate(`${selected}`)}
            disabled={!selected || selected === '0'}
          >
            <SummarizeOutlinedIcon />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                lineHeight: '0.75rem',
                letterSpacing: '0.18px',
                color: 'black',
                ml: '0.5rem',
              }}
            >
              {t('menu.preview.actions.editTemplate')}
            </Typography>
          </Button>
        </Box>
      );
    case EnumInputActionScreen.INSERT:
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
          <Box className="flex items-center space-x-4">
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingNode.enabled}
                  onChange={e => {
                    setEditingNode({
                      ...editingNode,
                      enabled: e.target.checked,
                    });
                  }}
                />
              }
              label={t('menuItem.fields.enabled')}
              sx={{ mt: '2rem' }}
            />
          </Box>
          <Box className="flex items-center space-x-4">
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DatePicker
                label={t('menuItem.fields.startPublication')}
                value={editingNode.startPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    startPublication: date,
                  });
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.startPublication && params.error}
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
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DatePicker
                label={t('menuItem.fields.endPublication')}
                value={editingNode.endPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    endPublication: date,
                  });
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.endPublication && params.error}
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
          </Box>
          <Divider sx={{ mt: '2rem' }} />
          {data?.menu.meta?.length && (
            <Box sx={{ mt: '1.5rem' }}>
              <Typography variant="h3">
                {t('menu.fields.meta.title', { count: data.menu.meta.length })}
              </Typography>
              {renderMeta()}
              <Divider sx={{ mt: '1.5rem' }} />
            </Box>
          )}
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
              onClick={() => handleActionChange(EnumInputActionScreen.SELECTING_ACTION)}
            >
              {t('buttons.discard')}
            </Button>
          </Box>
        </Form>
      );
    case EnumInputActionScreen.UPDATE:
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
          <Box className="flex items-center space-x-4">
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingNode.enabled}
                  onChange={e => {
                    setEditingNode({
                      ...editingNode,
                      enabled: e.target.checked,
                    });
                  }}
                />
              }
              label={t('menuItem.fields.enabled')}
              sx={{ mt: '2rem' }}
            />
          </Box>
          <Box className="flex items-center space-x-4">
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DatePicker
                label={t('menuItem.fields.startPublication')}
                value={editingNode.startPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    startPublication: date,
                  });
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.startPublication && params.error}
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
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DatePicker
                label={t('menuItem.fields.endPublication')}
                value={editingNode.endPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    endPublication: date,
                  });
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.endPublication && params.error}
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
          </Box>
          <Divider sx={{ mt: '2rem' }} />
          {data?.menu.meta?.length && (
            <Box sx={{ mt: '1.5rem' }}>
              <Typography variant="h3">
                {t('menu.fields.meta.title', { count: data.menu.meta.length })}
              </Typography>
              {renderMeta()}
              <Divider sx={{ mt: '1.5rem' }} />
            </Box>
          )}
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
              onClick={() => handleActionChange(EnumInputActionScreen.SELECTING_ACTION)}
            >
              {t('buttons.discard')}
            </Button>
          </Box>
        </Form>
      );
    case EnumInputActionScreen.DELETE:
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
              onClick={() => handleActionChange(EnumInputActionScreen.SELECTING_ACTION)}
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
