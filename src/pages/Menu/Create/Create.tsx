import { Box, Button, Divider, styled, TextField, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MenuService from '../../../api/services/MenuService';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;

const Form = styled('form')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  marginTop: '2rem',
});

export const CreateMenu = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { dispatch } = React.useContext(NotificationContext);

  const [name, setName] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string>('');

  const [loadingSubmit, setLoadingSubmit] = React.useState<boolean>(false);

  const onBackClickHandler = () => {
    navigate('/');
  };

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
    // TODO: Implement the API request.
    // The Promise below simulates the loading time of the request, remove it when you implement the request itself.
    try {
      await MenuService.createMenu({ name });
      dispatch({
        type: ActionTypes.OPEN_NOTIFICATION,
        message: `${t('notification.createSuccess', {
          resource: t('menu.title', { count: 1 }),
          context: 'male',
        })}!`,
      });
      navigate('../');
    } catch (error) {
      openDefaultErrorNotification(error, dispatch);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Box>
      <Typography variant="h1" component="h1" sx={{ py: '1rem' }}>
        {t('menu.create.title')}
      </Typography>
      <Divider />
      <Form onSubmit={handleFormSubmit}>
        <TextField
          id="name"
          label={t('menu.of', { field: 'name' })}
          placeholder={t('menu.create.placeholders.name')}
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
            <Button
              variant="contained"
              color="tertiary"
              disabled={loadingSubmit}
              onClick={onBackClickHandler}
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
              {t('menu.create.title')}
            </Button>
          </Box>
        </Box>
      </Form>
    </Box>
  );
};
