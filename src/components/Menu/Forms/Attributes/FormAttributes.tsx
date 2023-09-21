import React, { useRef, useState } from 'react';
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
  const [open, setOpen] = React.useState(false);
  const [selectedMeta, setSelectedMeta] = React.useState<IMenuMetaWithErrors>(null);
  const { t, i18n } = useTranslation();
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
      } else if (m.name.length === null || '') {
        metaNameError = t('form.validation.must_have_name', {
          field: t('menu.fields.meta.of', { field: 'name' }),
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
              if (value.trim() === '' && m.required === true) {
                updatedMeta[index].errors.defaultValue = t('form.validation.must_have_defaulValue');
              } else {
                updatedMeta[index].errors.defaultValue = '';
              }
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

  const handleClickOpen = (attribute: IMenuMetaWithErrors) => {
    setOpen(true);
    setSelectedMeta(attribute);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteAttribute = () => {
    if (!selectedMeta.id) {
      setMeta(meta.filter(m => m.id !== selectedMeta.id));
    } else {
      const deletedIndex = meta.findIndex(m => m.id === selectedMeta.id);

      for (let i = 0; i < meta.length; i++) {
        const m = meta[i];
        if (m.id === selectedMeta.id) {
          m.action = EnumInputAction.DELETE;
        } else if (i > deletedIndex) {
          m.order = selectedMeta.order >= m.order ? m.order : m.order - 1;
        }
      }

      setMeta([...meta]);
      handleClose();
    }
  };

  // Drag and Drop icon
  const renderMeta = (
    droppableProvided: DroppableProvided,
    droppableSnapshot: DroppableStateSnapshot,
  ) =>
    meta.map((m, i) => {
      if (m.action === EnumInputAction.DELETE) {
        return;
      }
      return (
        <Draggable key={m.order.toString()} draggableId={m.order.toString()} index={i}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.draggableProps}
              sx={{
                opacity: snapshot.isDragging ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                width: '66.75rem',
                minHeight: '14.25rem',
                maxHeight: '16.25rem',
              }}
              className={`border-gray-200 border bg-white rounded-md p-4 w-fit${
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
                  marginLeft: '-46rem',
                  paddingTop: '4px',
                  marginRight: '7px',
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
                  sx={{ display: 'flex', paddingTop: '1.75rem', marginLeft: '-32px' }}
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

                      updatedMeta[i].name = value; // Update the value first

                      if (value.trim() === '') {
                        updatedMeta[i].errors.name = t('form.validation.must_have_name');
                      } else {
                        updatedMeta[i].errors.name = ''; // Clears any previous errors
                      }

                      setMeta(updatedMeta);
                    }}
                    inputProps={{
                      maxLength: MENU_VALIDATION.META_NAME_MAX_LENGTH,
                    }}
                    InputLabelProps={{
                      shrink: true,
                      style: {
                        color: '#022831',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '500',
                      },
                    }}
                    error={!!m.errors.name}
                    helperText={m.errors.name}
                    sx={{
                      width: '22.5rem',
                      height: '3rem',
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
                <Box
                  sx={{ display: 'flex', marginLeft: '-2rem', marginTop: '1.5rem' }}
                  className=" space-x-2"
                >
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
                    marginLeft: '-2rem',
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
                    right: '0',
                  }}
                >
                  <Button
                    variant="text"
                    sx={{
                      color: '#313338',
                      minWidth: '12px',
                      padding: '8px',
                      marginRight: '-2rem',
                      marginBottom: '-12px',
                    }}
                    onClick={() => handleClickOpen(m)}
                  >
                    <DeleteIcon sx={{ width: '24px', height: '28px', right: '-3rem' }} />
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Draggable>
      );
    });

  // Draw Attributes
  return (
    <Form
      sx={{
        backgroundColor: '#F4F5F7',
      }}
      onSubmit={handleFormSubmit}
    >
      <Box
        sx={{
          backgroundColor: '#F4F5F7',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#F4F5F7',
          flexDirection: 'column',
          alignItems: 'flex-start',
          flex: 1,
          marginTop: '-18px',
          // marginBottom:
        }}
      >
        <Typography variant="body1" sx={{ color: '#6C7077' }} component="p">
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
      <Box sx={{ backgroundColor: '#F4F5F7' }}>
        {meta?.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  className="flex flex-col flex-initial space-y-4 w-fit pr-4 overflow-y-auto"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ marginTop: '1.5rem' }}
                >
                  {renderMeta(provided, snapshot)}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Box>

      {/* Fixed buttons in footer ( add attributes, cancel, save ) */}
      <Box
        sx={{
          flex: '0 1 auto',
          display: 'flex',
          direction: 'row',
          marginTop: '1.4rem',
          position: 'relative',
          marginBottom: '1.7rem',
          padding: '2rem',
          marginRight: '2rem',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#F4F5F7',
            borderTop: '1px solid #D4D8DD',
            // marginRight: '1rem',
            borderColor: '#D6D7D9',
            position: 'fixed',
            width: '96.2%',
            marginLeft: '2rem',
            right: '0',

            left: '0',
            bottom: '0',
            zIndex: '1000',
            padding: '1rem',
            alignItems: 'center',
            // justifyContent: 'flex-end',
            display: 'flex',
          }}
          className="fixed-buttons"
        >
          <Box sx={{ width: '100%' }}>
            <Button
              variant="text"
              onClick={() => {
                const highestOrder = Math.max(...meta.map(m => m.order), 0);
                const updatedMeta = [...meta];
                updatedMeta.push({
                  action: EnumInputAction.CREATE,
                  id: meta.length + 1,
                  name: '',
                  type: MenuMetaType.TEXT,
                  order: highestOrder + 1,
                  required: false,
                  enabled: true,
                  defaultValue: '',
                  errors: {},
                });
                setMeta(updatedMeta);
                setTimeout(() => {
                  window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth',
                  });
                }, 0);
              }}
              startIcon={
                <AddIcon
                  sx={{
                    backgroundColor: '#265EFD',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    marginLeft: '-1.2rem',
                    marginRight: '-1.2rem',
                  }}
                />
              }
              sx={{
                color: '#265EFD',
                letterSpacing: '0.5%',
                lineHeight: '18px',
                marginLeft: '-1rem',
              }}
            >
              {t('menu.fields.meta.add')}
            </Button>
          </Box>
          <Box
            sx={{
              width: '85%',
              right: '0',
              zIndex: '1000',
              alignItems: 'center',
              justifyContent: 'flex-end',
              display: 'flex',
              marginRight: '-1rem',
            }}
            className="fixed-buttons"
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loadingSubmit}
              sx={{
                marginLeft: '16px',
              }}
            >
              {t('buttons.save_editions')}
              {/* {action === FormAction.CREATE ? t('menu.create.title') : t('menu.edit.title')} */}
            </Button>
          </Box>
        </Box>
      </Box>
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
          {t('menu.fields.meta.dialog_delete_attribute')} {selectedMeta?.name || ''}?
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
            onClick={handleDeleteAttribute}
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
    </Form>
  );
}
