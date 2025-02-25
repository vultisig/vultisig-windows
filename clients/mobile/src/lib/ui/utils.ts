import { DefaultTheme } from 'styled-components/native'

import { ThemeColors } from './theme'

interface ThemeGetterParams {
  theme: DefaultTheme
}

type ColorName = keyof Omit<ThemeColors, 'getLabelColor'>

export const getColor =
  (color: ColorName) =>
  ({ theme }: ThemeGetterParams): string => {
    return theme.colors[color]
  }
