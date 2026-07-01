import { ThemeColors } from './ThemeColors'
import { ThemeName } from './ThemeName'

export type Theme = {
  name: ThemeName
  fontFamily: string
  iconStyle: 'vultisig' | 'station'
  colors: ThemeColors
}
