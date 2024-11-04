import { DefaultTheme } from 'styled-components';

import { HSLA } from '../colors/HSLA';
import { sharedColors } from './shared';

const backgroundHue = 217;
const backgroundSaturation = 91;

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    ...sharedColors,
    text: new HSLA(219, 45, 91),
    textSupporting: new HSLA(216, 41, 85),
    textShy: new HSLA(205, 15, 55),

    primary: new HSLA(167, 78, 55),
    primaryAlt: new HSLA(224, 98, 64),

    idle: new HSLA(34, 93, 54),
    success: new HSLA(135, 59, 49),

    background: new HSLA(backgroundHue, backgroundSaturation, 9),
    foreground: new HSLA(216, 81, 13),
    foregroundExtra: new HSLA(216, 63, 18),
    foregroundSuper: new HSLA(215, 62, 28),

    overlay: new HSLA(backgroundHue, backgroundSaturation, 1, 0.8),

    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
    mistExtra: new HSLA(0, 0, 100, 0.13),
    danger: new HSLA(0, 82, 57, 1),
  },
};
