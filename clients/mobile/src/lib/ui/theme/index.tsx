export const darkTheme = {
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
    foreground: 'rgba(7, 23, 31, 1)',
    foregroundExtra: 'rgba(12, 28, 39, 1)',
    foregroundSuper: 'rgba(27, 54, 72, 1)',
    foregroundSuperContrast: 'rgba(57, 89, 112, 1)',
    overlay: 'rgba(2, 4, 8, 0.8)',
    success: 'rgba(17, 181, 123, 1)',
    contrast: 'rgba(255, 255, 255, 1)',
    mist: 'rgba(255, 255, 255, 0.06)',
    mistExtra: 'rgba(255, 255, 255, 0.13)',
    danger: 'rgba(255, 0, 68, 1)',
    buttonBackgroundDisabled: 'rgba(14, 25, 41, 1)', // HSLA(217, 57%, 14%)
  },
  gradients: {
    primary: `linear-gradient(135deg, #0339C7, #2155DF)`,
    button: `linear-gradient(90deg, #11C89C, #FFC25C)`,
    alert: `linear-gradient(45deg, #FF5C5C, #5CA7FF)`,
    overlay: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))`,
  },
}

export type ThemeColors = typeof darkTheme.colors
