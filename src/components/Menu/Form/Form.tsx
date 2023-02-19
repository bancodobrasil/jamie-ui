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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { MENU_VALIDATION } from '../../../constants';
import { EnumInputAction, IMenuMetaWithErrors, MenuMetaType } from '../../../types';

const Form = styled('form')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  marginTop: '2rem',
});

interface Props {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  setNameError: (nameError: string) => void;
  meta: IMenuMetaWithErrors[];
  setMeta: (meta: IMenuMetaWithErrors[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  action: 'create' | 'edit';
}

export const MenuForm = ({
  name,
  setName,
  nameError,
  setNameError,
  meta,
  setMeta,
  onSubmit,
  onBack,
  action,
}: Props) => {
  const { t, i18n } = useTranslation();

  const [initialMeta] = React.useState<IMenuMetaWithErrors[]>(JSON.parse(JSON.stringify(meta)));

  const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);

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

    setLoadingSubmit(true);
    onSubmit();
  };

  const renderMetaDefaultValue = (m: IMenuMetaWithErrors, index: number) => {
    switch (m.type) {
      case MenuMetaType.TEXT:
        return (
          <TextField
            id={`meta[${index}].defaultValue`}
            label={t('menu.fields.meta.defaultValue')}
            placeholder={
              action === 'create'
                ? t('menu.create.placeholders.meta.defaultValue')
                : t('menu.edit.placeholders.meta.defaultValue')
            }
            value={m.defaultValue}
            required={
              m.action === EnumInputAction.UPDATE &&
              m.required &&
              initialMeta.find(m2 => m2.id === m.id)?.required === false
            }
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
              action === 'create'
                ? t('menu.create.placeholders.meta.defaultValue')
                : t('menu.edit.placeholders.meta.defaultValue')
            }
            value={m.defaultValue}
            required={
              m.action === EnumInputAction.UPDATE &&
              m.required &&
              initialMeta.find(m2 => m2.id === m.id)?.required === false
            }
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
                  required={
                    m.action === EnumInputAction.UPDATE &&
                    m.required &&
                    initialMeta.find(m2 => m2.id === m.id)?.required === false
                  }
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

  const renderMeta = () =>
    meta.map((m, i) => (
      <Box key={i}>
        <Box sx={{ display: 'flex' }} className="space-x-2">
          <span className="text-lg mt-[0.75rem]">{m.order}.</span>
          <TextField
            id={`meta[${i}].name`}
            label={t('menu.fields.meta.name')}
            placeholder={
              action === 'create'
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
              disabled={action === 'edit' && m.action !== EnumInputAction.CREATE}
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
        <Box sx={{ display: 'flex', ml: '1.5rem' }} className="mt-2 space-x-2">
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
    ));
  return (
    <Form onSubmit={handleFormSubmit}>
      <TextField
        id="name"
        label={t('menu.of', { field: 'name' })}
        placeholder={
          action === 'create'
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
      <Typography variant="h3" sx={{ mt: '2rem' }}>
        {t('menu.fields.meta.title', { count: 2 })}
      </Typography>
      {meta.length > 0 && <div className="mt-8 space-y-4">{renderMeta()}</div>}
      <Box sx={{ mt: '2rem' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const updatedMeta = [...meta];
            updatedMeta.push({
              action: EnumInputAction.CREATE,
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
            {action === 'create' ? t('menu.create.title') : t('menu.edit.title')}
          </Button>
        </Box>
      </Box>
    </Form>
  );
};
