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
  uuid?: string;
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
  uuid,
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
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              id="mustCheckBoxConditions"
              checked={hasConditions}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { checked } = e.target;
                setHasConditions(checked);
              }}
              color="primary"
            />
          }
          label={<span style={{ fontWeight: 'bold' }}>{t('menu.fields.hasConditions')}</span>}
        />
        <Box
          id="belowDeferChanges"
          sx={{
            // height:'1.12rem',
            marginTop: '-12px',
            letterSpacing: '50%',
            fontSize: '13px',
            color: '#6C7077',
            marginLeft: '2rem',
          }}
        >
          {t('menu.fields.belowConditions')}.
        </Box>
      </Box>
    );
  };
  //
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
        sx={{ width: '16rem', my: '1.5rem' }}
        className="bg-white"
      />
    );
  };

  const nameErrorOrLabel = () => {
    if (nameError) return nameError;
    return t('menu.fields.belowNameField');
  };

  // Draw the menu
  return (
    <Form onSubmit={handleFormSubmit} sx={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
      {action === FormAction.UPDATE && (
        <Box
          sx={{
            flex: '0 1 auto',
            flexDirection: 'column',
            mb: '1rem',
            height: '4rem',
          }}
        >
          <TextField
            id="uuid"
            label={<span style={{ color: 'black' }}>{t('menu.of', { field: 'uuid' })}</span>}
            disabled
            value={uuid}
            sx={{
              width: '33.2rem',
              backgroundColor: 'white',
              borderColor: 'black',
            }}
          />
        </Box>
      )}
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
          helperText={nameErrorOrLabel()}
          sx={{ width: '33.2rem', height: '3rem', backgroundColor: 'white' }}
        />
        <Box sx={{ mt: '2.5rem', width: '28.25rem', height: '2.63rem' }}>
          {renderHasConditionCheckbox()}
          <Box>
            <Box sx={{ mt: '1.5rem', width: '28.25rem', height: '2.63rem' }}>
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
                label={
                  <span style={{ fontWeight: 'bold' }}>{t('menu.fields.mustDeferChanges')}</span>
                }
              />
              <Box
                id="belowDeferChanges"
                sx={{
                  marginTop: '-12px',
                  letterSpacing: '50%',
                  fontSize: '13px',
                  color: '#6C7077',
                  marginLeft: '2rem',
                }}
              >
                {t('menu.fields.belowDeferChanges')}.
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {renderParameters()}
      <Box
        sx={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          marginBottom: '3rem',
        }}
      >
        <Box />
        <Box
          sx={{
            flex: 1,
            width: '33.25rem',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              height: '12rem',
            }}
          >
            <Button
              variant="contained"
              disabled={loadingSubmit}
              onClick={onBack}
              sx={{
                marginRight: '16px',
                backgroundColor: '#ffffff',
                color: '#d51b05',
                '&:hover': {
                  backgroundColor: '#f0f0f0', // Cor de fundo mais escura ao passar o mouse
                },
              }}
            >
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
