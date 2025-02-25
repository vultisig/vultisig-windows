import type { CSSProp } from 'styled-components/native'

import { darkTheme } from './src/lib/ui/theme'

type ThemeType = typeof darkTheme

declare module 'styled-components/native' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}

declare module 'react' {
  interface Attributes {
    css?: CSSProp
  }
}
