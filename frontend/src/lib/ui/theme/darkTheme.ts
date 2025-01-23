import { DefaultTheme } from 'styled-components';

import { HSLA } from '../colors/HSLA';
import { sharedColors } from './shared';

const backgroundHue = 217;
const backgroundSaturation = 91;

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    ...sharedColors,
    text: new HSLA(220, 67, 96),
    textSupporting: new HSLA(215, 40, 85),
    textShy: new HSLA(214, 21, 60),
    textDark: new HSLA(217, 91, 9),
    primary: new HSLA(167, 78, 55),
    primaryAlt: new HSLA(224, 98, 64),
    idle: new HSLA(34, 93, 54),
    background: new HSLA(backgroundHue, backgroundSaturation, 9),
    foreground: new HSLA(216, 81, 13),
    foregroundExtra: new HSLA(216, 63, 18),
    foregroundSuper: new HSLA(215, 62, 28),
    overlay: new HSLA(backgroundHue, backgroundSaturation, 1, 0.8),
    success: new HSLA(166, 84, 43, 1.0),
    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
    mistExtra: new HSLA(0, 0, 100, 0.13),
    danger: new HSLA(0, 100, 68, 1.0),
    buttonBackgroundDisabled: new HSLA(217, 57, 14),
  },
  gradients: {
    primary: `linear-gradient(135deg, #0339C7, #2155DF)`,
    button: `linear-gradient(90deg, #11C89C, #FFC25C)`,
    alert: `linear-gradient(45deg, #FF5C5C, #5CA7FF)`,
    overlay: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))`,
  },
};
