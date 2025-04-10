import { AntDesignThemeProvider } from '@clients/extension/src/providers/AntDesignThemeProvider'
import { I18nProvider } from '@clients/extension/src/providers/I18nProvider'
import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <MpcDeviceProvider value="extension">
      <ThemeProvider theme={darkTheme}>
        <QueryProvider>
          <I18nProvider>
            <WalletCoreProvider>
              <AntDesignThemeProvider>
                {children}
                <GlobalStyle />
              </AntDesignThemeProvider>
            </WalletCoreProvider>
          </I18nProvider>
        </QueryProvider>
      </ThemeProvider>
    </MpcDeviceProvider>
  )
}
