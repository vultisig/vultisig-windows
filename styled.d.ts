import 'styled-components'

import { Theme as DesktopTheme } from './clients/desktop/src/lib/ui/theme/Theme'

declare module 'styled-components' {
  type ThemeType = typeof DesktopTheme
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}
