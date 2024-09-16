import { DefaultTheme } from 'styled-components';

import { HSLA } from '../colors/HSLA';
import { sharedColors } from './shared';

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    ...sharedColors,
    text: new HSLA(0, 0, 100, 0.81),
    textSupporting: new HSLA(0, 0, 61),
    textShy: new HSLA(0, 0, 100, 0.28),

    primary: new HSLA(167, 78, 55),
    primaryAlt: new HSLA(224, 98, 64),

    background: new HSLA(217, 91, 9),
    foreground: new HSLA(216, 81, 13),
    foregroundExtra: new HSLA(216, 63, 18),

    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
    mistExtra: new HSLA(0, 0, 100, 0.13),
    danger: new HSLA(0, 82, 57, 1),
  },
};
