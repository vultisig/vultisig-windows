import { ThemeColors } from '@lib/ui/theme/ThemeColors'
import { DefaultTheme } from 'styled-components/native'

interface ThemeGetterParams {
  theme: DefaultTheme
}

type ColorName = keyof Omit<ThemeColors, 'getLabelColor'>

export const getColor =
  (color: ColorName) =>
  ({ theme }: ThemeGetterParams): string => {
    const rgbaArray = theme.colors[color] as [number, number, number, number]
    return `rgba(${rgbaArray.join(', ')})`
  }
