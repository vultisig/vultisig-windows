import { HSLA } from '../colors/HSLA';

export type ThemeColors = {
  text: HSLA;
  textSupporting: HSLA;
  textShy: HSLA;
  textDark: HSLA;
  primary: HSLA;
  primaryAlt: HSLA;
  idle: HSLA;
  background: HSLA;
  foreground: HSLA;
  foregroundExtra: HSLA;
  foregroundSuper: HSLA;
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
