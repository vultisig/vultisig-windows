import 'styled-components'

import { Theme as DesktopTheme } from './clients/desktop/src/lib/ui/theme/Theme'
import { Theme as MobileTheme } from './clients/mobile/src/lib/ui/theme'

declare module 'styled-components' {
  type ThemeType = typeof MobileTheme | typeof DesktopTheme
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}
