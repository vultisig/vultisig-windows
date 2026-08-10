import { HSLA } from '@lib/ui/colors/HSLA'
import { DefaultTheme } from 'styled-components'

import { sharedColors } from './shared'
import { iconStyles } from './Theme'

export const darkTheme: DefaultTheme = {
  name: 'dark',
  fontFamily: "'Brockmann', sans-serif",
  iconStyle: iconStyles[0],
  colors: {
    ...sharedColors,

    text: new HSLA(220, 67, 96),
    textSupporting: new HSLA(211, 10, 43),
    // Text/Tertiary
    textShy: new HSLA(214, 21, 60),
    // Text/Secondary
    textShyExtra: new HSLA(214, 40, 85, 1),

    primary: new HSLA(167, 78, 55),
    primaryAlt: new HSLA(224, 98, 64),
    success: new HSLA(166, 83, 43),
    danger: new HSLA(0, 100, 68),
    dangerBackground: new HSLA(0, 43, 12),
    idle: new HSLA(38, 100, 68),
    idleDark: new HSLA(39, 40, 15),
    info: new HSLA(212, 100, 68),

    background: new HSLA(217, 91, 9),
    // Backgrounds/surface-1
    foreground: new HSLA(216, 81, 13),
    foregroundDark: new HSLA(213, 80, 14),
    // Backgrounds/surface-2 Borders/Light
    foregroundExtra: new HSLA(216, 63, 18),
    // Borders/Normal
    foregroundSuper: new HSLA(215, 62, 28),
    foregroundSuperContrast: new HSLA(207, 42, 40),

    overlay: new HSLA(217, 91, 1, 0.8),
    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.06),
    mistExtra: new HSLA(0, 0, 100, 0.13),

    // Button tokens are the exact values of the design system button set
    buttonBackgroundDisabled: new HSLA(220.85, 68.12, 13.53), // #0b1a3a
    buttonLinkHover: new HSLA(0, 0, 100, 0.04),
    // Primary/Accent 3
    buttonPrimary: new HSLA(223.52, 100, 52.16), // #0b4eff
    buttonHover: new HSLA(214.53, 74.9, 46.86), // #1e6ad1
    buttonSecondary: new HSLA(215.79, 62.64, 17.84), // #11284a
    buttonSecondaryHover: new HSLA(215.08, 52.85, 24.12), // #1d385e
    buttonNeutral: new HSLA(223.58, 74.8, 50.2), // #2155df
    buttonNeutralHover: new HSLA(214.53, 74.9, 46.86), // #1e6ad1
    buttonSuccessHover: new HSLA(165, 85.44, 40.39), // #0fbf93
    buttonTextDisabled: new HSLA(215.68, 14.98, 51.57), // #718096
    primaryAccentTwo: new HSLA(224, 96, 40),
    primaryAccentFour: new HSLA(224, 96, 64),

    transparent: new HSLA(0, 0, 0, 0),
    white: new HSLA(0, 0, 100),
  },
}
