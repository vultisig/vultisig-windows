import { ThemeColors } from './ThemeColors'
import { ThemeName } from './ThemeName'

/** Supported icon style variants for themed UI assets. */
export const iconStyles = ['vultisig', 'station'] as const

/** Icon style variant derived from the supported theme icon styles. */
export type IconStyle = (typeof iconStyles)[number]

/** Application theme contract consumed by styled-components. */
export type Theme = {
  name: ThemeName
  fontFamily: string
  iconStyle: IconStyle
  colors: ThemeColors
}
