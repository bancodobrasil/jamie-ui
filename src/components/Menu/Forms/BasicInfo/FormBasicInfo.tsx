import { Box, Button, Checkbox, FormControlLabel, styled, TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { JAMIE_FEATURE_CONDITIONS, MENU_VALIDATION } from '../../../../constants';
import { FormAction } from '../../../../types';
import './styles.css';

const Form = styled('form')({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: '2rem',
  overflowY: 'hidden',
});

interface Props {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  setNameError: (nameError: string) => void;
  mustDeferChanges: boolean;
  setMustDeferChanges: (mustDeferChanges: boolean) => void;
  hasConditions: boolean;
  setHasConditions: (hasConditions: boolean) => void;
  parameters: string;
  setParameters: (parameters: string) => void;
  loadingSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
  action: FormAction;
}

export const FormBasicInfo = ({
  name,
  setName,
  nameError,
  setNameError,
  mustDeferChanges,
  setMustDeferChanges,
  hasConditions,
  setHasConditions,
  parameters,
  setParameters,
  loadingSubmit,
  onSubmit,
  onBack,
  action,
}: Props) => {
  const { t } = useTranslation();

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

    onSubmit();
  };

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

  const renderParameters = () => {
    if (!hasConditions) return null;
    return (
      <TextField
        id="parameters"
        label="Parameters"
        multiline
        minRows={3}
        value={parameters}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = e.target;
          setParameters(value);
        }}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ width: '16rem' }}
        className="bg-white"
      />
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
        {renderParameters()}
      </Box>
      <Box sx={{ flex: '0 1 auto' }}>
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
