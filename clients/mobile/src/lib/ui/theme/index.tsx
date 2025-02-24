import { darkTheme as darkThemeHSLA } from '@lib/ui/theme/darkTheme'
import { DefaultTheme } from 'styled-components/native'

import { convertThemeToRgba } from './utils'

export const darkTheme: DefaultTheme = convertThemeToRgba(darkThemeHSLA)
