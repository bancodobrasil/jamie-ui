import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { JAMIE_FEATURE_CONDITIONS, MENU_VALIDATION } from '../../../constants';
import { EnumInputAction, FormAction, IMenuMetaWithErrors, MenuMetaType } from '../../../types';
import './styles.css';

const Form = styled('form')({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '2rem',
  overflowY: 'hidden',
});

const reorder: { <T>(list: T[], startIndex: number, endIndex: number): T[] } = (
  list,
  startIndex,
  endIndex,
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

interface Props {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  setNameError: (nameError: string) => void;
  mustDeferChanges: boolean;
  setMustDeferChanges: (mustDeferChanges: boolean) => void;
  meta: IMenuMetaWithErrors[];
  setMeta: (meta: IMenuMetaWithErrors[]) => void;
  hasConditions: boolean;
  setHasConditions: (hasConditions: boolean) => void;
  parameters: string;
  setParameters: (parameters: string) => void;
  loadingSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
  action: FormAction;
}

export const MenuForm = ({
  name,
  setName,
  nameError,
  setNameError,
  mustDeferChanges,
  setMustDeferChanges,
  meta,
  setMeta,
  hasConditions,
  parameters,
  setParameters,
  setHasConditions,
  loadingSubmit,
  onSubmit,
  onBack,
  action,
}: Props) => {
  const { t, i18n } = useTranslation();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let tmpNameError = '';
    if (name.length < MENU_VALIDATION.NAME_MIN_LENGTH) {
      tmpNameError = t('form.validation.min', {
        field: t('menu.fields.name'),
        min: MENU_VALIDATION.NAME_MIN_LENGTH,
      });
    } else if (name.length > MENU_VALIDATION.NAME_MAX_LENGTH) {
      tmpNameError = t('form.validation.max', {
        field: t('menu.fields.name'),
        max: MENU_VALIDATION.NAME_MAX_LENGTH,
      });
    }
    if (tmpNameError) {
      setNameError(tmpNameError);
      return;
    }

    let metaHasError = false;

    meta.forEach((m, i) => {
      let metaNameError = '';
      if (m.name.length < MENU_VALIDATION.NAME_MIN_LENGTH) {
        metaNameError = t('form.validation.min', {
          field: t('menu.fields.meta.of', { field: 'name' }),
          min: MENU_VALIDATION.NAME_MIN_LENGTH,
        });
      } else if (m.name.length > MENU_VALIDATION.NAME_MAX_LENGTH) {
        metaNameError = t('form.validation.max', {
          field: t('menu.fields.meta.of', { field: 'name' }),
          max: MENU_VALIDATION.NAME_MAX_LENGTH,
        });
      }
      meta.slice(0, i).forEach((m2, j) => {
        if (i !== j && m.name === m2.name) {
          metaNameError = t('form.validation.uniqueIndex', {
            field: t('menu.fields.meta.of', { field: 'name' }),
            index: j + 1,
          });
        }
      });
      if (metaNameError) {
        const updatedMeta = [...meta];
        updatedMeta[i].errors.name = metaNameError;
        setMeta(updatedMeta);
        metaHasError = true;
      }
    });
    if (metaHasError) return;

    onSubmit();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = reorder(meta, result.source.index, result.destination.index);
    const updatedMeta = items.map((m, i) => {
      m.action = !m.action ? EnumInputAction.UPDATE : m.action;
      if (m.action !== EnumInputAction.DELETE) {
        return {
          ...m,
          order: i + 1,
        };
      }
      return m;
    });
    setMeta(updatedMeta);
  };

  const renderMetaDefaultValue = (m: IMenuMetaWithErrors, index: number) => {
    switch (m.type) {
      case MenuMetaType.TEXT:
        return (
          <TextField
            id={`meta[${index}].defaultValue`}
            label={t('menu.fields.meta.defaultValue')}
            placeholder={
              action === FormAction.CREATE
                ? t('menu.create.placeholders.meta.defaultValue')
                : t('menu.edit.placeholders.meta.defaultValue')
            }
            value={m.defaultValue}
            required={m.required}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              const updatedMeta = [...meta];
              if (updatedMeta[index].action !== EnumInputAction.CREATE) {
                updatedMeta[index].action = EnumInputAction.UPDATE;
              }
              updatedMeta[index].defaultValue = value;
              updatedMeta[index].errors.defaultValue = '';
              setMeta(updatedMeta);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!m.errors.defaultValue}
            helperText={m.errors.defaultValue}
            sx={{ width: '16rem' }}
            className="bg-white"
          />
        );
      case MenuMetaType.NUMBER:
        return (
          <TextField
            id={`meta[${index}].defaultValue`}
            label={t('menu.fields.meta.defaultValue')}
            placeholder={
              action === FormAction.CREATE
                ? t('menu.create.placeholders.meta.defaultValue')
                : t('menu.edit.placeholders.meta.defaultValue')
            }
            value={m.defaultValue}
            required={m.required}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              const updatedMeta = [...meta];
              if (updatedMeta[index].action !== EnumInputAction.CREATE) {
                updatedMeta[index].action = EnumInputAction.UPDATE;
              }
              updatedMeta[index].defaultValue = value;
              updatedMeta[index].errors.defaultValue = '';
              setMeta(updatedMeta);
            }}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!m.errors.defaultValue}
            helperText={m.errors.defaultValue}
            sx={{ width: '16rem' }}
            className="bg-white"
            type="number"
          />
        );
      case MenuMetaType.BOOLEAN:
        return (
          <FormControlLabel
            control={
              <Checkbox
                id={`meta[${index}].defaultValue`}
                checked={m.defaultValue === true}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { checked } = e.target;
                  const updatedMeta = [...meta];
                  if (updatedMeta[index].action !== EnumInputAction.CREATE) {
                    updatedMeta[index].action = EnumInputAction.UPDATE;
                  }
                  updatedMeta[index].defaultValue = !!checked;
                  updatedMeta[index].errors.defaultValue = '';
                  setMeta(updatedMeta);
                }}
                color="primary"
              />
            }
            label={t('menu.fields.meta.defaultValue')}
          />
        );
      case MenuMetaType.DATE:
        return (
          <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
            <DatePicker
              label={t('menu.fields.meta.defaultValue')}
              value={m.defaultValue}
              onChange={date => {
                const updatedMeta = [...meta];
                if (updatedMeta[index].action !== EnumInputAction.CREATE) {
                  updatedMeta[index].action = EnumInputAction.UPDATE;
                }
                updatedMeta[index].defaultValue = date;
                updatedMeta[index].errors.defaultValue = '';
                setMeta(updatedMeta);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  required={m.required}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!m.errors.defaultValue}
                  helperText={m.errors.defaultValue}
                  sx={{ width: '16rem' }}
                  className="bg-white"
                  inputProps={{
                    ...params.inputProps,
                    placeholder: `${t('common.example')}: ${DateTime.now()
                      .plus({ days: 5 })
                      .setLocale(i18n.language)
                      .toLocaleString()}`,
                  }}
                />
              )}
            />
          </LocalizationProvider>
        );
    }
  };

  const renderMeta = (
    droppableProvided: DroppableProvided,
    droppableSnapshot: DroppableStateSnapshot,
  ) =>
    meta.map((m, i) => (
      <Draggable key={m.id.toString()} draggableId={m.id.toString()} index={i}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            sx={{ opacity: snapshot.isDragging ? 0.5 : 1, display: 'flex', alignItems: 'center' }}
            className={`border-gray-200 border rounded-md p-4 mb-4 w-fit${
              !m.enabled ? ' bg-gray-200/75' : ''
            }`}
          >
            <div {...provided.dragHandleProps}>
              <DragIndicatorIcon />
            </div>
            <span className="text-lg ml-2">{m.order}</span>
            <Box className="ml-8">
              <Box sx={{ display: 'flex' }} className="space-x-2">
                <TextField
                  id={`meta[${i}].name`}
                  label={t('menu.fields.meta.name')}
                  placeholder={
                    action === FormAction.CREATE
                      ? t('menu.create.placeholders.meta.name')
                      : t('menu.edit.placeholders.meta.name')
                  }
                  value={m.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const { value } = e.target;
                    const updatedMeta = [...meta];
                    if (updatedMeta[i].action !== EnumInputAction.CREATE) {
                      updatedMeta[i].action = EnumInputAction.UPDATE;
                    }
                    updatedMeta[i].name = value;
                    updatedMeta[i].errors.name = '';
                    setMeta(updatedMeta);
                  }}
                  inputProps={{
                    maxLength: MENU_VALIDATION.META_NAME_MAX_LENGTH,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!m.errors.name}
                  helperText={m.errors.name}
                  sx={{ width: '16rem' }}
                  className="bg-white"
                  required
                />
                <FormControl sx={{ width: '16rem' }} className="bg-white" required>
                  <InputLabel id={`meta[${i}].type-label`}>
                    {t('menu.fields.meta.type.title', { count: 1 })}
                  </InputLabel>
                  <Select
                    labelId={`meta[${i}].type-label`}
                    id={`meta[${i}].type`}
                    value={m.type}
                    label={t('menu.fields.meta.type.title', { count: 1 })}
                    disabled={action === FormAction.UPDATE && m.action !== EnumInputAction.CREATE}
                    onChange={(e: SelectChangeEvent) => {
                      const { value } = e.target;
                      const updatedMeta = [...meta];
                      if (updatedMeta[i].action !== EnumInputAction.CREATE) {
                        updatedMeta[i].action = EnumInputAction.UPDATE;
                      }
                      updatedMeta[i].type = value as MenuMetaType;
                      setMeta(updatedMeta);
                      switch (value as MenuMetaType) {
                        case MenuMetaType.TEXT:
                        case MenuMetaType.NUMBER:
                        case MenuMetaType.DATE:
                          updatedMeta[i].defaultValue = '';
                          break;
                        case MenuMetaType.BOOLEAN:
                          updatedMeta[i].defaultValue = false;
                          break;
                      }
                    }}
                  >
                    <MenuItem value={MenuMetaType.TEXT}>
                      {t(`menu.fields.meta.type.${MenuMetaType.TEXT}`)}
                    </MenuItem>
                    <MenuItem value={MenuMetaType.NUMBER}>
                      {t(`menu.fields.meta.type.${MenuMetaType.NUMBER}`)}
                    </MenuItem>
                    <MenuItem value={MenuMetaType.BOOLEAN}>
                      {t(`menu.fields.meta.type.${MenuMetaType.BOOLEAN}`)}
                    </MenuItem>
                    <MenuItem value={MenuMetaType.DATE}>
                      {t(`menu.fields.meta.type.${MenuMetaType.DATE}`)}
                    </MenuItem>
                  </Select>
                </FormControl>
                {renderMetaDefaultValue(m, i)}
              </Box>
              <Box sx={{ display: 'flex' }} className="mt-2 space-x-2">
                <FormControlLabel
                  control={
                    <Checkbox
                      id={`meta[${i}].required`}
                      checked={m.required || m.type === MenuMetaType.BOOLEAN}
                      disabled={m.type === MenuMetaType.BOOLEAN}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const { checked } = event.target;
                        const updatedMeta = [...meta];
                        if (updatedMeta[i].action !== EnumInputAction.CREATE) {
                          updatedMeta[i].action = EnumInputAction.UPDATE;
                        }
                        updatedMeta[i].required = checked;
                        setMeta(updatedMeta);
                      }}
                    />
                  }
                  label={t('menu.fields.meta.required')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      id={`meta[${i}].enabled`}
                      checked={m.enabled}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const { checked } = event.target;
                        const updatedMeta = [...meta];
                        if (updatedMeta[i].action !== EnumInputAction.CREATE) {
                          updatedMeta[i].action = EnumInputAction.UPDATE;
                        }
                        updatedMeta[i].enabled = checked;
                        setMeta(updatedMeta);
                      }}
                    />
                  }
                  label={t('menu.fields.meta.enabled')}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Draggable>
    ));

  const renderHasConditionCheckbox = () => {
    if (!JAMIE_FEATURE_CONDITIONS) return null;
    return (
      <Box sx={{ mt: '1rem' }}>
        <FormControlLabel
          control={
            <Checkbox
              id="hasConditions"
              checked={hasConditions}
              disabled={action === FormAction.UPDATE}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { checked } = e.target;
                setHasConditions(checked);
              }}
              color="primary"
            />
          }
          label={`${t('menu.fields.hasConditions')}?`}
        />
      </Box>
    );
  };

  return (
    <Form onSubmit={handleFormSubmit}>
      <Box sx={{ flex: '0 1 auto', flexDirection: 'column' }}>
        <TextField
          id="name"
          label={t('menu.of', { field: 'name' })}
          placeholder={
            action === FormAction.CREATE
              ? t('menu.create.placeholders.name')
              : t('menu.edit.placeholders.name')
          }
          required
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setNameError('');
            setName(value);
          }}
          inputProps={{
            maxLength: MENU_VALIDATION.NAME_MAX_LENGTH,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          error={!!nameError}
          helperText={nameError}
          sx={{ width: '16rem' }}
        />
        <Box sx={{ mt: '1rem' }}>
          <FormControlLabel
            control={
              <Checkbox
                id="mustDeferChanges"
                checked={mustDeferChanges}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { checked } = e.target;
                  setMustDeferChanges(checked);
                }}
                color="primary"
              />
            }
            label={t('menu.fields.mustDeferChanges')}
          />
        </Box>
        {renderHasConditionCheckbox()}
        <Typography variant="h3" sx={{ mt: '1rem' }}>
          {t('menu.fields.meta.title', { count: 2 })}
        </Typography>
      </Box>
      {meta.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                className="flex flex-col flex-initial mt-8 space-y-4 w-fit pr-4 overflow-y-auto"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {renderMeta(provided, snapshot)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Box sx={{ flex: '0 1 auto' }}>
        <Box sx={{ mt: '2rem' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const updatedMeta = [...meta];
              updatedMeta.push({
                action: EnumInputAction.CREATE,
                id: meta.length + 1,
                name: '',
                type: MenuMetaType.TEXT,
                order: meta.length + 1,
                required: false,
                enabled: true,
                defaultValue: '',
                errors: {},
              });
              setMeta(updatedMeta);
            }}
          >
            {t('menu.fields.meta.add')}
          </Button>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginTop: '16px',
          }}
        >
          <Box
            sx={{
              margin: '16px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <Button variant="contained" color="tertiary" disabled={loadingSubmit} onClick={onBack}>
              {t('buttons.cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loadingSubmit}
              sx={{
                marginLeft: '16px',
              }}
            >
              {action === FormAction.CREATE ? t('menu.create.title') : t('menu.edit.title')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Form>
  );
};
