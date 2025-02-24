/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CSSProp } from 'styled-components/native'

import { darkTheme } from './src/lib/ui/theme'

type ThemeType = typeof darkTheme

declare module 'styled-components' {
  export type DefaultTheme = ThemeType
}

declare module 'react' {
  interface DOMAttributes<T> {
    css?: CSSProp
  }
}
