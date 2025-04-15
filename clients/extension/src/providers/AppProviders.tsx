import { AntDesignThemeProvider } from '@clients/extension/src/providers/AntDesignThemeProvider'
import { I18nProvider } from '@clients/extension/src/providers/I18nProvider'
import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { defaultMpcLib } from '@core/mpc/mpcLib'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { OpenUrlProvider } from '@core/ui/state/openUrl'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'

const openUrl = (url: string) => window.open(url, '_blank')

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <VaultCreationMpcLibProvider value={defaultMpcLib}>
      <OpenUrlProvider value={openUrl}>
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
      </OpenUrlProvider>
    </VaultCreationMpcLibProvider>
  )
}
