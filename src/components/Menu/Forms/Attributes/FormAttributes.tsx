import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Select,
  TextField,
  Typography,
  Checkbox,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem,
  styled,
  IconButton,
  colors,
  Divider,
  Grid,
  DialogContentText,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
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
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { fontWeight, letterSpacing, lineHeight, minWidth, textAlign, width } from '@mui/system';
import { relative } from 'path';
import { EnumInputAction, FormAction, IMenuMetaWithErrors, MenuMetaType } from '../../../../types';
import { MENU_VALIDATION } from '../../../../constants';

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
  meta: IMenuMetaWithErrors[]; // meta == attributes
  setMeta: (meta: IMenuMetaWithErrors[]) => void;
  loadingSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
  action: FormAction;
}

export function FormAttributes({ meta, setMeta, loadingSubmit, onSubmit, onBack, action }: Props) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = event => {
    setSelectedOption(event.target.value);
  };

  /* Draw box of standard value */
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
            sx={{ width: '22.5rem' }}
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
            sx={{ width: '22.5rem' }}
            className="bg-white"
            type="number"
          />
        );
      case MenuMetaType.BOOLEAN:
        return (
          // <FormControlLabel
          //   control={
          //     <Checkbox
          //       id={`meta[${index}].defaultValue`}
          //       checked={m.defaultValue === true}
          //       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          //         const { checked } = e.target;
          //         const updatedMeta = [...meta];
          //         if (updatedMeta[index].action !== EnumInputAction.CREATE) {
          //           updatedMeta[index].action = EnumInputAction.UPDATE;
          //         }
          //         updatedMeta[index].defaultValue = !!checked;
          //         updatedMeta[index].errors.defaultValue = '';
          //         setMeta(updatedMeta);
          //       }}
          //       color="primary"
          //     />
          //   }
          //   label={t('menu.fields.meta.defaultValue')}
          //   sx={{ width: '22.5rem' }}
          // />
          <FormControl
            sx={{
              gap: '12px',
              borderBlockColor: '#758887',
              color: '#022831',
              width: '22.5rem',
            }}
          >
            <InputLabel>Valor Padrão</InputLabel>
            <Select label="Valor Padrão" value={selectedOption} onChange={handleChange}>
              <MenuItem value="verdadeiro">Verdadeiro</MenuItem>
              <MenuItem value="falso">Falso</MenuItem>
            </Select>
          </FormControl>
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
                  sx={{ width: '22.5rem' }}
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Drag and Drop icon
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
            sx={{
              opacity: snapshot.isDragging ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
            className={`border-gray-200 border rounded-md p-4 mb-4 w-fit${
              !m.enabled ? ' bg-gray-200/75' : ''
            }`}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                // position: 'fixed',
                top: '50%',
                // left: '46px',
                marginLeft: '-45rem',
              }}
            >
              <div {...provided.dragHandleProps}>
                <DragIndicatorIcon />
              </div>
              <span
                className="text-lg ml-2 font-custom font-roboto"
                style={{
                  fontSize: '20px',
                  letterSpacing: '0.15px',
                  lineHeight: '24px',
                  fontWeight: '500',
                  width: '283px',
                  height: '24px',
                  gap: '2px',
                  marginLeft: '-1px',
                }}
              >
                <span className="font-roboto">{t('menu.edit.tabs.attributes')}</span> {m.order}
              </span>
            </Box>
            <Box className="ml-8">
              <Box
                sx={{ display: 'flex', paddingTop: '1.5rem', marginLeft: '-15px' }}
                className="space-x-2"
              >
                {/* name field */}
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
                    style: { color: '#022831' },
                  }}
                  error={!!m.errors.name}
                  helperText={m.errors.name}
                  sx={{
                    width: '22.5rem',
                    height: '3rem',
                    color: '#red',
                  }}
                  className="bg-white"
                  required
                />
                {/* type field */}
                <FormControl
                  sx={{
                    width: '16.25rem',
                    height: '3rem',
                    gap: '12px',
                    borderBlockColor: '#758887',
                    color: '#022831',
                  }}
                  className="bg-white"
                  required
                >
                  <InputLabel id={`meta[${i}].type-label`} sx={{ color: '#022831' }}>
                    {t('menu.fields.meta.type.title', { count: 1 })}
                  </InputLabel>
                  {/* Possibles types */}
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
                    {/* List of the possibles types */}
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
              {/* Checkboxes */}
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
                  label={
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        lineHeight: '24px',
                        letterSpacing: '0em',
                        textAlign: 'left',
                      }}
                    >
                      {t('menu.fields.meta.required')}
                    </span>
                  }
                />

                {/* <FormControlLabel
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
                /> */}
              </Box>
              <Box
                sx={{
                  paddingLeft: '2rem',
                  color: '#6C7077',
                  fontSize: '14px',
                  fontWeight: '450',
                  lineHeight: '18px',
                  letterSpacing: '0.005em',
                  textAlign: 'left',
                  marginTop: '-12px',
                }}
              >
                {t('menu.fields.meta.description_required')}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  height: '1.5rem',
                  // width: '65rem',
                }}
              >
                <Button sx={{ color: '#313338', width: '3rem' }} onClick={handleClickOpen}>
                  <DeleteIcon sx={{ width: '24px', height: '28px' }} />
                </Button>

                <Dialog
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                  // sx={{ width: '40.5rem', height: '20rem' }}
                >
                  <DialogTitle
                    sx={{ fontSize: '24px', color: '#38879D', letterSpacing: '0.18px' }}
                    id="alert-dialog-title"
                  >
                    {t('menu.fields.meta.dialog_delete_attribute')} {m.name}?
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText
                      sx={{
                        fontSize: '16px',
                        letterSpacing: '0.5px',
                        lineHeight: '24px',
                        color: '#758887',
                      }}
                      id="alert-dialog-description"
                    >
                      {t('menu.fields.meta.dialog_delete_attribute_description')}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant="text"
                      onClick={handleClose}
                      sx={{
                        color: '#38879D',
                        fontSize: '14px',
                        letterSpacing: '1.25px',
                        lineHeight: '16px',
                      }}
                    >
                      {t('menu.fields.meta.dialog_delete_attribute_quit')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleClose}
                      sx={{
                        backgroundColor: '#38879D',
                        color: 'white',
                        fontSize: '14px',
                        letterSpacing: '1.25px',
                        lineHeight: '16px',
                      }}
                      autoFocus
                    >
                      {t('menu.fields.meta.dialog_delete_attribute_confirm')}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </Box>
          </Box>
        )}
      </Draggable>
    ));

  // Draw Attributes
  return (
    <Form onSubmit={handleFormSubmit}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          flex: 1,
        }}
      >
        <Typography variant="body1" component="p">
          {t('menu.fields.meta.description')}
        </Typography>
        {/* <Typography variant="body1" component="p" sx={{ mt: '0.5rem' }}>
          <Trans i18nKey="menuItem.editTemplate.templateFormat.description">
            X{' '}
            <Link
              href="https://handlebarsjs.com/"
              rel="noopener noreferrer"
              target="_blank"
              underline="always"
            >
              Y
            </Link>{' '}
            Z
          </Trans>
        </Typography> */}
      </Box>
      <Box>
        {meta?.length > 0 && (
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
      </Box>
      <Box sx={{ flex: '0 1 auto' }}>
        {/* Button that add attributes */}
        <Box sx={{ mt: '2rem', marginBottom: '5rem' }}>
          <Button
            variant="text"
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
            startIcon={
              <AddIcon
                sx={{
                  backgroundColor: '#265EFD',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                }}
              />
            }
            sx={{ color: '#265EFD', letterSpacing: '0.5%', lineHeight: '18px' }}
          >
            {t('menu.fields.meta.add')}
          </Button>
        </Box>
      </Box>
      {/* Button that cancel or save the edition */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          marginTop: '16px',
          position: 'relative',
          background: 'white',
        }}
      >
        <Box
          sx={{
            top: '90%',
            transform: 'translateY(-40%)',
            marginTop: '2rem',
            backgroundColor: 'white',
            position: 'fixed',
            width: '100%',
            marginLeft: '-2rem',
            bottom: '0',
          }}
          className="fixed-buttons"
        >
          <Divider
            sx={{
              marginBottom: '1rem',
              width: '100%',
              flexDirection: 'column',
              right: '0',

              // position: 'fixed',
            }}
          />
          <Grid
            xs={6}
            md={4}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginRight: '3rem',
              zIndex: '-10000',
              backgroundColor: 'white',
            }}
          >
            <Button
              variant="contained"
              color="tertiary"
              disabled={loadingSubmit}
              onClick={onBack}
              sx={{ color: '#D51B06', background: 'F4F5F7' }}
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
              {t('buttons.save')}
              {/* {action === FormAction.CREATE ? t('menu.create.title') : t('menu.edit.title')} */}
            </Button>
          </Grid>
          <Grid xs={6} md={4} sx={{ backgroundColor: 'white', height: '3rem' }} />
        </Box>
      </Box>
    </Form>
  );
}
