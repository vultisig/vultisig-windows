import { HSLA } from '@lib/ui/colors/HSLA'
import { DefaultTheme } from 'styled-components'

import { sharedColors } from './shared'

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    ...sharedColors,

    text: new HSLA(220, 67, 96),
    textSupporting: new HSLA(211, 10, 43),
    textShy: new HSLA(214, 21, 60),
    textDark: new HSLA(217, 91, 9),

    primary: new HSLA(167, 78, 55),
    primaryAlt: new HSLA(224, 98, 64),
    success: new HSLA(167, 78, 55),
    danger: new HSLA(0, 100, 68),
    idle: new HSLA(38, 100, 68),
    idleDark: new HSLA(39, 40, 15),

    background: new HSLA(217, 91, 9),
    foreground: new HSLA(216, 81, 13),
    foregroundDark: new HSLA(213, 80, 14),
    foregroundExtra: new HSLA(216, 63, 18),
    foregroundSuper: new HSLA(215, 62, 28),
    foregroundSuperContrast: new HSLA(207, 42, 40),

    borderLight: new HSLA(216, 63, 18),
    overlay: new HSLA(217, 91, 1, 0.8),
    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
    mistExtra: new HSLA(0, 0, 100, 0.13),

    buttonBackgroundDisabled: new HSLA(217, 57, 14),
    buttonLinkHover: new HSLA(0, 0, 100, 0.04),
    buttonPrimary: new HSLA(224, 75, 50),
    buttonPrimaryHover: new HSLA(215, 75, 47),
    buttonSecondary: new HSLA(216, 81, 13),
    buttonSecondaryHover: new HSLA(215, 75, 47),
    buttonTextDisabled: new HSLA(216, 15, 52),

    transparent: new HSLA(0, 0, 0, 0),
    white: new HSLA(0, 0, 100),
  },

  gradients: {
    primary: `linear-gradient(135deg, #0339C7, #2155DF)`,
    button: `linear-gradient(90deg,  #11C89C, #FFC25C)`,
    alert: `linear-gradient(45deg,  #FF5C5C, #5CA7FF)`,
    overlay: `linear-gradient(0deg,   rgba(0,0,0,.6), rgba(0,0,0,.8))`,
  },
}
