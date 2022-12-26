import { PaletteColor, PaletteColorOptions } from '@mui/material/styles/createPalette';

interface HighlightColors {
  background: {
    soft: string;
    main: string;
  };
  text: string;
  icon: string;
}
interface BorderColors {
  main: string;
  selected: string;
}
interface IconColors {
  main: string;
  selected: string;
}
declare module '@mui/material/styles/createPalette' {
  interface Palette {
    tertiary: PaletteColor;
    link: PaletteColor;
    highlight: HighlightColors;
    border: BorderColors;
    icon: IconColors;
  }
  interface PaletteOptions {
    tertiary: PaletteColorOptions;
    link: PaletteColorOptions;
    highlight: HighlightColors;
    border: BorderColors;
    icon: IconColors;
  }
}

declare module '@mui/material' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    link: true;
  }
}
