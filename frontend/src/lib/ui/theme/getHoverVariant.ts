import { DefaultTheme } from 'styled-components';
import { ThemeColors } from './ThemeColors';
import { match } from '../../utils/match';

interface ThemeGetterParams {
  theme: DefaultTheme;
}

type ColorName = keyof Pick<ThemeColors, 'foreground' | 'primary'>;

export const getHoverVariant =
  (color: ColorName) =>
  ({ theme }: ThemeGetterParams) =>
    match(color, {
      foreground: () => theme.colors.foreground.getVariant({ l: l => l + 4 }),
      primary: () => theme.colors.primary.getVariant({ l: l => l * 0.92 }),
    }).toCssValue();
