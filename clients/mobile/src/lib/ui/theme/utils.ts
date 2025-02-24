import { HSLA } from '@lib/ui/colors/HSLA'
import { DefaultTheme } from 'styled-components/native'

export const convertThemeToRgba = (theme: DefaultTheme) => {
  return {
    ...theme,
    colors: Object.fromEntries(
      Object.entries(theme.colors).map(([key, value]) => [
        key,
        value instanceof HSLA ? value.toRgba() : value,
      ])
    ),
  }
}
