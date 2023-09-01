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
  mustCheckBoxConditions: boolean;
  setCheckBoxConditions: (mustCheckBoxConditions: boolean) => void;
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
  mustCheckBoxConditions,
  setCheckBoxConditions,
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
        sx={{ width: '16rem' }}
        className="bg-white"
      />
    );
  };

  // Draw the menu
  return (
      <Form onSubmit={handleFormSubmit}>
        <Box sx={{ flex: '0 1 auto', flexDirection: 'column',height: '20rem' }}>
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
            sx={{ width: '33.2rem', height: '3rem' }}
          />
          <Box
            id="belowNameField"
            sx={{
              width: '31rem',
              height: '1.25rem',
              padding: '20px 16px',
              opacity: '60%',
              fontSize: '13px',
            }}
          >
            {t('menu.fields.belowNameField')}
          </Box>
          <Box sx={{ mt: '1.5rem', width: '28.25rem', height: '2.63rem' }}>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    id="mustCheckBoxConditions"
                    checked={mustCheckBoxConditions}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const { checked } = e.target;
                      setCheckBoxConditions(checked);
                    }}
                    color="primary"
                  />
                }
                label={<span style={{ fontWeight: 'bold' }}>{t('menu.fields.hasConditions')}</span>}
              />
              <Box
                id="belowDeferChanges"
                sx={{
                  //height:'1.12rem',
                  letterSpacing: '50%',
                  fontSize: '13px',
                  color: '#6C7077',
                  marginLeft: '2rem',
                }}
              >
                {t('menu.fields.belowConditions')}.
              </Box>
            </Box>
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
                    //width: '28.2rem',
                    //height: '1.12rem',
                    letterSpacing: '50%',
                    fontSize: '13px',
                    color: '#6C7077',
                    marginLeft: '2rem',
                  }}
                >
                  {t('menu.fields.belowDeferChanges')}.
                </Box>
                {renderHasConditionCheckbox()}
                {renderParameters()}
              </Box>
            </Box>
          </Box>
        </Box>
      <Box sx={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
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
