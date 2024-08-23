import { DefaultTheme } from 'styled-components';
import { HSLA } from '../colors/HSLA';

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    text: new HSLA(210, 9, 96),
    primary: new HSLA(167, 78, 55),
    foreground: new HSLA(216, 81, 13),
    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
  },
};
