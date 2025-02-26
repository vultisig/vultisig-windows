type ThemeName = 'dark' | 'light'

export type ThemeColors = Record<
  | 'text'
  | 'textSupporting'
  | 'textShy'
  | 'textDark'
  | 'primary'
  | 'primaryAlt'
  | 'idle'
  | 'idleDark'
  | 'background'
  | 'foreground'
  | 'foregroundDark'
  | 'foregroundExtra'
  | 'foregroundSuper'
  | 'foregroundSuperContrast'
  | 'overlay'
  | 'contrast'
  | 'success'
  | 'mist'
  | 'mistExtra'
  | 'transparent'
  | 'white'
  | 'danger'
  | 'buttonBackgroundDisabled',
  string
>

export interface Theme {
  name: ThemeName
  colors: ThemeColors
}

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    white: 'rgba(255, 255, 255, 1)',
    transparent: 'rgba(0, 0, 0, 0)',
    text: 'rgba(238, 242, 255, 1)',
    textSupporting: 'rgba(191, 202, 222, 1)',
    textShy: 'rgba(141, 150, 165, 1)',
    textDark: 'rgba(5, 9, 18, 1)',
    primary: 'rgba(18, 214, 162, 1)',
    primaryAlt: 'rgba(72, 88, 255, 1)',
    idle: 'rgba(255, 206, 109, 1)',
    idleDark: 'rgba(56, 46, 23, 1)',
    background: 'rgba(5, 9, 18, 1)',
    foregroundDark: 'rgba(8, 22, 30, 1)',
    foreground: 'rgba(2, 18, 43, 1)',
    foregroundExtra: 'rgba(17, 40, 74, 1)',
    foregroundSuper: 'rgba(27, 54, 72, 1)',
    foregroundSuperContrast: 'rgba(57, 89, 112, 1)',
    overlay: 'rgba(2, 4, 8, 0.8)',
    success: 'rgba(181, 123, 1)',
    contrast: 'rgba(255, 255, 255, 1)',
    mist: 'rgba(255, 255, 255, 0.06)',
    mistExtra: 'rgba(255, 255, 255, 0.13)',
    danger: 'rgba(255, 0, 68, 1)',
    buttonBackgroundDisabled: 'rgba(14, 25, 41, 1)',
  },
}
