import { HSLA } from '@lib/ui/colors/HSLA'
import { DefaultTheme } from 'styled-components'

import { sharedColors } from './shared'

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    ...sharedColors,

    text: new HSLA(220, 67, 96),
    textSupporting: new HSLA(211, 10, 43),
    // Text/Tertiary
    textShy: new HSLA(214, 21, 60),
    textShyExtra: new HSLA(214, 40, 85, 1),

    primary: new HSLA(167, 78, 55),
    primaryAlt: new HSLA(224, 98, 64),
    success: new HSLA(166, 83, 43),
    danger: new HSLA(0, 100, 68),
    idle: new HSLA(38, 100, 68),
    idleDark: new HSLA(39, 40, 15),
    info: new HSLA(212, 100, 68),

    background: new HSLA(217, 91, 9),
    foreground: new HSLA(216, 81, 13),
    foregroundDark: new HSLA(213, 80, 14),
    // Backgrounds/surface-2
    foregroundExtra: new HSLA(216, 63, 18),
    foregroundSuper: new HSLA(215, 62, 28),
    foregroundSuperContrast: new HSLA(207, 42, 40),

    overlay: new HSLA(217, 91, 1, 0.8),
    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
    mistExtra: new HSLA(0, 0, 100, 0.13),

    buttonBackgroundDisabled: new HSLA(217, 57, 14),
    buttonLinkHover: new HSLA(0, 0, 100, 0.04),
    buttonPrimary: new HSLA(224, 75, 50),
    buttonHover: new HSLA(215, 75, 47),
    buttonTextDisabled: new HSLA(216, 15, 52),
    primaryAccentTwo: new HSLA(224, 96, 40),
    primaryAccentFour: new HSLA(224, 96, 64),

    transparent: new HSLA(0, 0, 0, 0),
    white: new HSLA(0, 0, 100),
  },
}
