import { Box, Button, styled, TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
        fullWidth
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
      />
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
