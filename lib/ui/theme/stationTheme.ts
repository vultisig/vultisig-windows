import { HSLA } from '@lib/ui/colors/HSLA'
import { DefaultTheme } from 'styled-components'

import { sharedColors } from './shared'
import { iconStyles } from './Theme'

export const stationTheme: DefaultTheme = {
  name: 'dark',
  fontFamily: "'Montserrat', 'Brockmann', sans-serif",
  iconStyle: iconStyles[1],
  colors: {
    ...sharedColors,

    // Figma Station tokens, node 77884:158876.
    text: new HSLA(0, 0, 95), // #f2f2f2
    textSupporting: new HSLA(240, 1, 73), // #b8b8ba
    textShy: new HSLA(0, 0, 64), // #a3a3a3
    textShyExtra: new HSLA(240, 1, 73), // #b8b8ba

    primary: new HSLA(167, 78, 55), // #33e6bf
    primaryAlt: new HSLA(224, 82, 60), // #4572ed
    success: new HSLA(167, 78, 55), // #33e6bf
    danger: new HSLA(0, 100, 68),
    dangerBackground: new HSLA(0, 41, 12),
    idle: new HSLA(36, 100, 67),
    idleDark: new HSLA(36, 58, 15),
    info: new HSLA(224, 97, 65), // #5180fc

    background: new HSLA(0, 0, 12), // #1f1f1f
    foreground: new HSLA(240, 5, 15), // #242428
    foregroundDark: new HSLA(240, 6, 17), // #29292e
    foregroundExtra: new HSLA(240, 5, 22), // #35353b
    foregroundSuper: new HSLA(240, 6, 20), // #303036
    foregroundSuperContrast: new HSLA(240, 3, 41),

    overlay: new HSLA(0, 0, 1, 0.8),
    contrast: new HSLA(0, 0, 100),
    mist: new HSLA(0, 0, 100, 0.05),
    mistExtra: new HSLA(0, 0, 100, 0.1),

    buttonBackgroundDisabled: new HSLA(240, 6, 19),
    buttonLinkHover: new HSLA(0, 0, 100, 0.05),
    buttonPrimary: new HSLA(224, 82, 60), // #4572ed
    buttonHover: new HSLA(224, 89, 66), // #5b84f5
    buttonSecondary: new HSLA(240, 5, 22), // #35353b
    buttonSecondaryHover: new HSLA(240, 5, 25),
    buttonNeutral: new HSLA(224, 82, 60), // #4572ed
    buttonNeutralHover: new HSLA(224, 89, 66), // #5b84f5
    buttonTextDisabled: new HSLA(240, 3, 54),
    primaryAccentTwo: new HSLA(224, 82, 60),
    primaryAccentFour: new HSLA(224, 89, 66),

    transparent: new HSLA(0, 0, 0, 0),
    white: new HSLA(0, 0, 100),
  },
}
