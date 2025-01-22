import { DefaultTheme } from 'styled-components';

import { match } from '../../utils/match';
import { ThemeColors } from './ThemeColors';

interface ThemeGetterParams {
  theme: DefaultTheme;
}

type ColorName = keyof Pick<
  ThemeColors,
  'foreground' | 'primary' | 'idle' | 'textDark'
>;

export const getHoverVariant =
  (color: ColorName) =>
  ({ theme }: ThemeGetterParams) =>
    match(color, {
      foreground: () => theme.colors.foreground.getVariant({ l: l => l + 4 }),
      primary: () => theme.colors.primary.getVariant({ l: l => l * 0.92 }),
      textDark: () => theme.colors.textDark.getVariant({ l: l => l + 4 }),
      idle: () => theme.colors.idle.getVariant({ l: l => l + 4 }),
    }).toCssValue();
