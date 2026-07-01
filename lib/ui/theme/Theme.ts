import { ThemeColors } from './ThemeColors'
import { ThemeName } from './ThemeName'

export const iconStyles = ['vultisig', 'station'] as const
export type IconStyle = (typeof iconStyles)[number]

export type Theme = {
  name: ThemeName
  fontFamily: string
  iconStyle: IconStyle
  colors: ThemeColors
}
