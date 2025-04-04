import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { ConfigProvider } from 'antd'

import { I18nProvider } from './I18nProvider'
import { QueryProvider } from './QueryClientProvider'

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <QueryProvider>
        <I18nProvider>
          <WalletCoreProvider>
            <ConfigProvider>
              {children}
              <GlobalStyle />
            </ConfigProvider>
          </WalletCoreProvider>
        </I18nProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
