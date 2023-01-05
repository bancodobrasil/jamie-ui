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
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IMenuMetaWithErrors, MenuMetaType } from '../../../types';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;

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
  onSubmit: () => void;
  onBack: () => void;
  action: 'create' | 'edit';
}

export const MenuForm = ({
  name,
  setName,
  nameError,
  setNameError,
  onSubmit,
  onBack,
  action,
}: Props) => {
  const { t } = useTranslation();
  const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);
  const [meta, setMeta] = React.useState<IMenuMetaWithErrors[]>([]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let tmpNameError = '';
    if (name.length < NAME_MIN_LENGTH) {
      tmpNameError = t('form.validation.min', {
        field: t('menu.fields.name'),
        min: NAME_MIN_LENGTH,
      });
    } else if (name.length > NAME_MAX_LENGTH) {
      tmpNameError = t('form.validation.max', {
        field: t('menu.fields.name'),
        max: NAME_MAX_LENGTH,
      });
    }
    if (tmpNameError) {
      setNameError(tmpNameError);
      return;
    }

    setLoadingSubmit(true);
    onSubmit();
  };

  const renderMeta = () =>
    meta.map((m, i) => (
      <Box key={i} sx={{ display: 'flex', mt: '2rem' }} className="space-x-2">
        <TextField
          id={`meta[${i}].name`}
          label={t('menu.fields.meta.of', { field: 'name' })}
          placeholder={
            action === 'create'
              ? t('menu.create.placeholders.meta.name')
              : t('menu.edit.placeholders.meta.name')
          }
          value={meta[i].name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            const updatedMeta = [...meta];
            updatedMeta[i].name = value;
            updatedMeta[i].errors.name = '';
            setMeta(updatedMeta);
          }}
          inputProps={{
            maxLength: NAME_MAX_LENGTH,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          error={!!meta[i].errors.name}
          helperText={meta[i].errors.name}
          sx={{ width: '16rem' }}
        />
        <FormControl sx={{ width: '16rem' }}>
          <InputLabel id={`meta[${i}].type-label`}>
            {t('menu.fields.meta.of', { field: 'type.title_one' })}
          </InputLabel>
          <Select
            labelId={`meta[${i}].type-label`}
            id={`meta[${i}].type`}
            value={meta[i].type}
            label={t('menu.fields.meta.of', { field: 'type.title_one' })}
            required
            onChange={(e: SelectChangeEvent) => {
              const { value } = e.target;
              const updatedMeta = [...meta];
              updatedMeta[i].type = value as MenuMetaType;
              setMeta(updatedMeta);
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
        <FormControlLabel
          control={
            <Checkbox
              id={`meta[${i}].required`}
              checked={meta[i].required}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { checked } = event.target;
                const updatedMeta = [...meta];
                updatedMeta[i].required = checked;
                setMeta(updatedMeta);
              }}
            />
          }
          label={t('menu.fields.meta.required')}
        />
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
          maxLength: NAME_MAX_LENGTH,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        error={!!nameError}
        helperText={nameError}
        sx={{ width: '16rem' }}
      />
      {renderMeta()}
      <Box sx={{ mt: '2rem' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const updatedMeta = [...meta];
            updatedMeta.push({ name: '', type: MenuMetaType.TEXT, required: false, errors: {} });
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
