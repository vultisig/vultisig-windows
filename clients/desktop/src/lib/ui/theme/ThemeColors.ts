import { HSLA } from '../colors/HSLA';

export type ThemeColors = {
  text: HSLA;
  textSupporting: HSLA;
  textShy: HSLA;
  textDark: HSLA;
  primary: HSLA;
  primaryAlt: HSLA;
  idle: HSLA;
  idleDark: HSLA;
  background: HSLA;
  foreground: HSLA;
  foregroundDark: HSLA;
  foregroundExtra: HSLA;
  foregroundSuper: HSLA;
  foregroundSuperContrast: HSLA;
  overlay: HSLA;
  contrast: HSLA;
  success: HSLA;
  mist: HSLA;
  mistExtra: HSLA;
  transparent: HSLA;
  white: HSLA;
  danger: HSLA;
  buttonBackgroundDisabled: HSLA;
};

export type ThemeGradients = {
  primary: string;
  button: string;
  alert: string;
  overlay: string;
};
