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
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  EnumInputAction,
  IEditingNode,
  IMenu,
  IMenuMeta,
  INode,
  MenuMetaType,
} from '../../../types';
import { MENU_ITEM_VALIDATION } from '../../../constants';
import { EnumInputActionScreen } from '../../../pages/Menu/Items';

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  paddingRight: '1rem',
  paddingBottom: '1rem',
  overflowY: 'auto',
});

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
  operationScreen: EnumInputActionScreen;
  setOperationScreen: (operationScreen: EnumInputActionScreen) => void;
  findNodeById: (nodes: INode[], id: number) => INode | undefined;
  handleUpdate: () => Promise<void>;
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
  operationScreen,
  setOperationScreen,
  findNodeById,
  setEditingNode,
  handleUpdate,
}: Props) => {
  const { i18n, t } = useTranslation();

  const [labelError, setLabelError] = React.useState<string>('');
  const [startPublicationError, setStartPublicationError] = React.useState<string>('');
  const [endPublicationError, setEndPublicationError] = React.useState<string>('');

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
      return;
    }

    try {
      await handleUpdate();
    } catch (error) {
      console.error(error);
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
    }

    try {
      await handleUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleActionChange = React.useCallback(
    (action: EnumInputActionScreen) => {
      const selectedNode = findNodeById(nodes, Number(selected));
      if (expanded.find(id => id === selectedNode?.id.toString())) {
        setExpanded([...expanded, selectedNode.id.toString()]);
      }
      let node: INode;
      const meta = {};
      switch (action) {
        case EnumInputActionScreen.SELECTING_ACTION:
          setEditingNode(emptyEditingNode);
          break;
        case EnumInputActionScreen.INSERT:
          data?.menu.meta?.forEach(m => {
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
      setOperationScreen,
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

  const renderConditions = () => {
    if (!data.menu.hasConditions) return null;
    return (
      <Box sx={{ mt: '2rem', width: '100%' }}>
        <Typography variant="h3">{t('menu.preview.inputs.conditions.title')}</Typography>
        <TextField
          type="text"
          label="Rules"
          multiline
          minRows={3}
          InputLabelProps={{ shrink: true }}
          value={editingNode.rules}
          onChange={e => {
            setLabelError('');
            setEditingNode({ ...editingNode, rules: e.target.value });
          }}
          sx={{
            mt: '2rem',
            width: '100%',
          }}
        />
      </Box>
    );
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
              mt: '1rem',
            }}
          >
            {t('menu.preview.actions.title')}
          </Typography>
          {!selected && (
            <Typography
              variant="subtitle1"
              sx={{
                color: 'error.main',
                mb: '1rem',
              }}
            >
              {t('menu.preview.errors.noItemSelected')}
            </Typography>
          )}
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
              disabled={!selected}
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
                  color: selected ? 'green' : 'grey',
                  ml: '0.5rem',
                }}
              >
                {t('buttons.insert')}
              </Typography>
            </Button>
          </Box>
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
              mt: '1rem',
            }}
          >
            {t('menu.preview.actions.insert')}
          </Typography>
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
              <DateTimePicker
                disablePast
                label={t('menuItem.fields.startPublication')}
                value={editingNode.startPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    startPublication: date,
                  });
                }}
                maxDateTime={editingNode.endPublication}
                onError={(reason, value) => {
                  switch (reason) {
                    case 'invalidDate':
                      setStartPublicationError(t('error.common.date.invalidDate'));
                      break;
                    case 'disablePast':
                      setStartPublicationError(t('error.common.date.disablePast'));
                      break;
                    case 'maxDate':
                      setStartPublicationError(
                        t('error.common.date.maxDate', {
                          maxDate: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'minDate':
                      setStartPublicationError(
                        t('error.common.date.minDate', {
                          minDate: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'maxTime':
                      setStartPublicationError(
                        t('error.common.date.maxTime', {
                          maxTime: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    case 'minTime':
                      setStartPublicationError(
                        t('error.common.date.minTime', {
                          minTime: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    default:
                      setStartPublicationError('');
                      break;
                  }
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.startPublication && params.error}
                    helperText={startPublicationError || params.helperText}
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
                componentsProps={{
                  actionBar: {
                    actions: ['clear', 'today'],
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DateTimePicker
                disablePast
                label={t('menuItem.fields.endPublication')}
                value={editingNode.endPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    endPublication: date,
                  });
                }}
                minDateTime={editingNode.startPublication}
                onError={(reason, value) => {
                  switch (reason) {
                    case 'invalidDate':
                      setEndPublicationError(t('error.common.date.invalidDate'));
                      break;
                    case 'disablePast':
                      setEndPublicationError(t('error.common.date.disablePast'));
                      break;
                    case 'maxDate':
                      setEndPublicationError(
                        t('error.common.date.maxDate', {
                          maxDate: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'minDate':
                      setEndPublicationError(
                        t('error.common.date.minDate', {
                          minDate: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'maxTime':
                      setEndPublicationError(
                        t('error.common.date.maxTime', {
                          maxTime: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    case 'minTime':
                      setEndPublicationError(
                        t('error.common.date.minTime', {
                          minTime: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    default:
                      setEndPublicationError('');
                      break;
                  }
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.endPublication && params.error}
                    helperText={endPublicationError || params.helperText}
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
                componentsProps={{
                  actionBar: {
                    actions: ['clear', 'today'],
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
          <Divider sx={{ mt: '2rem' }} />
          {data?.menu.meta?.length > 0 && (
            <Box sx={{ mt: '1.5rem' }}>
              <Typography variant="h3">
                {t('menu.fields.meta.title', { count: data.menu.meta.length })}
              </Typography>
              {renderMeta()}
              <Divider sx={{ mt: '1.5rem' }} />
            </Box>
          )}
          {renderConditions()}
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
              disabled={!!labelError || !!startPublicationError || !!endPublicationError}
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
              mt: '1rem',
            }}
          >
            {t('menu.preview.actions.edit')}
          </Typography>
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
              <DateTimePicker
                disablePast
                label={t('menuItem.fields.startPublication')}
                value={editingNode.startPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    startPublication: date,
                  });
                }}
                maxDateTime={editingNode.endPublication}
                onError={(reason, value) => {
                  switch (reason) {
                    case 'invalidDate':
                      setStartPublicationError(t('error.common.date.invalidDate'));
                      break;
                    case 'disablePast':
                      setStartPublicationError(t('error.common.date.disablePast'));
                      break;
                    case 'maxDate':
                      setStartPublicationError(
                        t('error.common.date.maxDate', {
                          maxDate: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'minDate':
                      setStartPublicationError(
                        t('error.common.date.minDate', {
                          minDate: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'maxTime':
                      setStartPublicationError(
                        t('error.common.date.maxTime', {
                          maxTime: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    case 'minTime':
                      setStartPublicationError(
                        t('error.common.date.minTime', {
                          minTime: editingNode.endPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    default:
                      setStartPublicationError('');
                      break;
                  }
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.startPublication && params.error}
                    helperText={startPublicationError || params.helperText}
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
                componentsProps={{
                  actionBar: {
                    actions: ['clear', 'today'],
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              <DateTimePicker
                disablePast
                label={t('menuItem.fields.endPublication')}
                value={editingNode.endPublication}
                onChange={(date: DateTime) => {
                  setEditingNode({
                    ...editingNode,
                    endPublication: date,
                  });
                }}
                minDateTime={editingNode.startPublication}
                onError={(reason, value) => {
                  switch (reason) {
                    case 'invalidDate':
                      setEndPublicationError(t('error.common.date.invalidDate'));
                      break;
                    case 'disablePast':
                      setEndPublicationError(t('error.common.date.disablePast'));
                      break;
                    case 'maxDate':
                      setEndPublicationError(
                        t('error.common.date.maxDate', {
                          maxDate: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'minDate':
                      setEndPublicationError(
                        t('error.common.date.minDate', {
                          minDate: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATE_SHORT),
                        }),
                      );
                      break;
                    case 'maxTime':
                      setEndPublicationError(
                        t('error.common.date.maxTime', {
                          maxTime: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    case 'minTime':
                      setEndPublicationError(
                        t('error.common.date.minTime', {
                          minTime: editingNode.startPublication
                            .setLocale(i18n.language)
                            .toLocaleString(DateTime.DATETIME_SHORT),
                        }),
                      );
                      break;
                    default:
                      setEndPublicationError('');
                      break;
                  }
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    InputLabelProps={{ shrink: true }}
                    error={!!editingNode.endPublication && params.error}
                    helperText={endPublicationError || params.helperText}
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
                componentsProps={{
                  actionBar: {
                    actions: ['clear', 'today'],
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
          <Divider sx={{ mt: '2rem' }} />
          {data?.menu.meta?.length > 0 && (
            <Box sx={{ mt: '1.5rem' }}>
              <Typography variant="h3">
                {t('menu.fields.meta.title', { count: data.menu.meta.length })}
              </Typography>
              {renderMeta()}
              <Divider sx={{ mt: '1.5rem' }} />
            </Box>
          )}
          {renderConditions()}
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
              disabled={!!labelError || !!startPublicationError || !!endPublicationError}
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
    default:
      return null;
  }
};
