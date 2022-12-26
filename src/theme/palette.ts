/* eslint-disable import/no-anonymous-default-export */
import { colors } from '@mui/material';
import { PaletteOptions } from '@mui/material/styles';

const white = '#FFFFFF';
const black = '#000000';

const palette: PaletteOptions = {
  common: { black, white },
  primary: {
    contrastText: white,
    dark: '#403939',
    main: black,
    light: '#393434',
  },
  secondary: {
    contrastText: black,
    dark: '#1F6E84',
    main: '#38879D',
    light: '#52A1B7',
  },
  tertiary: {
    contrastText: black,
    dark: '#A9A9A9',
    main: '#C2C2C2',
    light: '#DCDCDC',
  },
  success: {
    contrastText: white,
    dark: colors.green[900],
    main: colors.green[600],
    light: colors.green[400],
  },
  info: {
    contrastText: white,
    dark: colors.blue[900],
    main: colors.blue[600],
    light: colors.blue[400],
  },
  warning: {
    contrastText: white,
    dark: colors.orange[900],
    main: colors.orange[600],
    light: colors.orange[400],
  },
  error: {
    contrastText: white,
    dark: colors.red[900],
    main: colors.red[600],
    light: colors.red[400],
  },
  link: {
    contrastText: white,
    dark: '#1A3BE4',
    main: '#3354FD',
    light: '#4D6EFF',
  },
  highlight: {
    background: {
      soft: '#EDF2FF',
      main: '#1653FD',
    },
    text: '#346AFF',
    icon: '#346AFF',
  },
  border: {
    main: '#B4B9C1',
    selected: '#3354FD',
  },
  icon: {
    main: '#313338',
    selected: '#3354FD',
  },
  text: {
    primary: black,
    secondary: '#6C7077',
    disabled: 'rgba(0, 0, 0, 0.26)',
  },
  background: {
    default: white,
    paper: white,
  },
  divider: colors.grey[200],
};

export default palette;
