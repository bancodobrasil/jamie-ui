import React, { useState } from 'react';
import {
  FormControlLabel,
  styled,
  Checkbox,
  TextField,
  Box,
  Typography,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { IEditingNode, IMenu, IMenuMeta, INode, MenuMetaType } from '../../../types';
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

  const handleFindParents = editingNode => {
    //
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

  const handleDiscard = () => {
    setEditingNode(emptyEditingNode);
    setOperationScreen(EnumInputActionScreen.NONE);
  };

  const [isDatePickerDisabled, setIsDatePickerDisabled] = useState(false);

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
              height: '3rem',
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
                let maxOrder = 1;
                if (parent?.children?.length) {
                  maxOrder = parent.children.length + 1;
                } else if (nodes.length) {
                  maxOrder = nodes.length + 1;
                }
                const order = Math.min(Math.max(Number(e.target.value), 1), maxOrder);
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
            {/* <FormControlLabel
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
            /> */}
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
            <Button variant="contained" color="error" sx={{ mt: '2rem' }} onClick={handleDiscard}>
              {t('buttons.discard')}
            </Button>
          </Box>
        </Form>
      );
    case EnumInputActionScreen.UPDATE:
      return (
        <Form onSubmit={handleUpdateSubmit}>
          {/* item's name */}
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontWeight: 500,
              fontSize: '24px',
              lineHeight: '28.8px',
              letterSpacing: '0.18px',
              textAlign: 'flex-start',
              width: '164px',
              mt: '1rem',
            }}
          >
            {editingNode.label}
          </Typography>
          <TextField
            type="text"
            label={t('menu.preview.inputs.name.labelItem')}
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
              borderColor: '#758887',
              color: '#022831',
            }}
          />
          <Box className="flex items-center space-x-4">
            {/* parent item */}
            <TextField
              required
              type="text"
              label={t('menu.preview.inputs.name.rootItem')}
              InputLabelProps={{ shrink: true }}
              value={
                editingNode.parentId
                  ? findNodeById(nodes, editingNode.parentId)?.label || ''
                  : 'Não há pai'
              }
              sx={{
                mt: '2rem',
                marginRight: '-0.5rem',
                width: '50%',
                height: '3rem',
              }}
            />
            {/* position */}
            <TextField
              required
              type="number"
              label={t('menu.preview.inputs.order.label')}
              InputLabelProps={{ shrink: true }}
              value={editingNode.order}
              onChange={e => {
                const parent = findNodeById(nodes, editingNode.parentId);
                let maxOrder = 1;
                if (parent?.children?.length) {
                  maxOrder = parent.children.length;
                } else if (nodes.length) {
                  maxOrder = nodes.length;
                }
                const order = Math.min(Math.max(Number(e.target.value), 1), maxOrder);
                if (order === editingNode.order) return;
                setEditingNode({
                  ...editingNode,
                  order,
                });
              }}
              sx={{
                mt: '2rem',
                width: '50%',
                height: '3rem',
              }}
            />
            {/* Enable */}
            {/* TODO: delete Enable, não deletei pq não tinha certeza para o que era */}
            {/* <FormControlLabel
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
          */}
          </Box>
          {/* Select */}
          {/* <Box className="flex items-center space-x-4">
            {/* parent item 
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="parent-item">{t('menu.preview.inputs.name.rootItem')}</InputLabel>
              <Select
                required
                labelId="parent-item"
                id="demo-simple-select-helper"
                // value={age}
                label={t('menu.preview.inputs.name.rootItem')}
                // onOpen={handleFindParents(editingNode)}
                // onChange={handleChange}
                renderValue={selected => {
                  if (!selected) {
                    const defaultValue = editingNode.parentId
                      ? findNodeById(nodes, editingNode.parentId)?.label
                      : 'Não há pai';
                    return <em>{defaultValue}</em>;
                  }
                  // const defaultValue = editingNode.parentId
                  //   ? findNodeById(nodes, editingNode.parentId)?.label
                  //   : 'Não há pai';
                  // return <em>defaultValue</em>;
                }}
              />
            </FormControl> 
          </Box> */}
          {/* Datas */}
          <Box className="flex items-center space-x-4">
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
              {/* Start Publication Date */}
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
                    sx={{ mt: '2rem', width: '18.25rem', marginRight: '-0.5rem' }}
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
              {/* End Publication Date */}
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
                disabled={isDatePickerDisabled || editingNode.enabled === true}
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
                    sx={{ mt: '2rem', width: '18.25rem' }}
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
          {/* Checkbox end publication  */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  checked={editingNode.enabled}
                  onChange={e => {
                    setEditingNode({
                      ...editingNode,
                      enabled: e.target.checked,
                    });
                    setIsDatePickerDisabled(e.target.checked);
                  }}
                />
              }
              label={
                <p
                  style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    lineHeight: '24px',
                    width: '7.5rem',
                    height: '1.5rem',
                  }}
                >
                  {t('menuItem.fields.withoutEndPublication')}
                </p>
              }
              sx={{ mt: '0.5rem' }}
            />
            {!data?.menu.meta?.length && (
              <Box sx={{ mt: '1rem', width: '355px' }}>
                <Button sx={{ m: '-1.5rem' }}>
                  <Typography variant="h5" sx={{ color: '#3354FD', textTransform: 'none' }}>
                    Deseja um novo campo no formulário?
                  </Typography>
                </Button>
              </Box>
            )}
          </Box>
          <Divider sx={{ mt: '1.5rem' }} />
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
            <Button variant="contained" color="error" sx={{ mt: '2rem' }} onClick={handleDiscard}>
              {t('buttons.discard')}
            </Button>
          </Box>
        </Form>
      );
    default:
      return null;
  }
};
