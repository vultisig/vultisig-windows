import { HSLA } from '@lib/ui/colors/HSLA'

export type ThemeColors = {
  text: HSLA
  textSupporting: HSLA
  textShy: HSLA
  textShyExtra: HSLA

  primary: HSLA
  primaryAlt: HSLA
  success: HSLA
  danger: HSLA
  dangerBackground: HSLA
  idle: HSLA
  idleDark: HSLA
  info: HSLA

  background: HSLA
  foreground: HSLA
  foregroundDark: HSLA
  foregroundExtra: HSLA
  foregroundSuper: HSLA
  foregroundSuperContrast: HSLA

  overlay: HSLA
  contrast: HSLA
  mist: HSLA
  mistExtra: HSLA

  buttonBackgroundDisabled: HSLA
  buttonLinkHover: HSLA
  buttonPrimary: HSLA
  buttonHover: HSLA
  buttonTextDisabled: HSLA
  primaryAccentTwo: HSLA
  primaryAccentFour: HSLA

  transparent: HSLA
  white: HSLA
}

export type ThemeColor = keyof ThemeColors
