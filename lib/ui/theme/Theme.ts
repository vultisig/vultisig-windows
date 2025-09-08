import { ThemeColors } from './ThemeColors'
import { ThemeName } from './ThemeName'

export type Theme = {
  name: ThemeName
  colors: ThemeColors
  gradients: {
    primary: string
    button: string
    alert: string
    overlay: string
  }
}
