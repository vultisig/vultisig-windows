import { AntDesignThemeProvider } from '@clients/extension/src/providers/AntDesignThemeProvider'
import { I18nProvider } from '@clients/extension/src/providers/I18nProvider'
import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { RemoteStateDependant } from '@clients/extension/src/providers/RemoteStateDependant'
import { MpcLib } from '@core/mpc/mpcLib'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { MpcLocalModeAvailabilityProvider } from '@core/ui/mpc/state/MpcLocalModeAvailability'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { VersionProvider } from '@core/ui/product/state/version'
import { OpenUrlProvider } from '@core/ui/state/openUrl'
import { SaveFileFunction, SaveFileProvider } from '@core/ui/state/saveFile'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'
import { createGlobalStyle } from 'styled-components'

import { StorageProvider } from '../state/storage'

const ExtensionGlobalStyle = createGlobalStyle`
  body {
    margin: 0 auto;
    min-height: 600px;
    overflow: hidden;
    width: 400px;
  }
`

const defaultMpcLib: MpcLib = 'DKLS'

const openUrl = (url: string) => window.open(url, '_blank')

const saveFile: SaveFileFunction = async ({ name, blob }) => {
  initiateFileDownload({ name, blob })
}

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <VersionProvider value="1.0.0">
      <MpcLocalModeAvailabilityProvider value={false}>
        <VaultCreationMpcLibProvider value={defaultMpcLib}>
          <OpenUrlProvider value={openUrl}>
            <SaveFileProvider value={saveFile}>
              <MpcDeviceProvider value="extension">
                <ThemeProvider theme={darkTheme}>
                  <QueryProvider>
                    <I18nProvider>
                      <WalletCoreProvider>
                        <StorageProvider>
                          <AntDesignThemeProvider>
                            <RemoteStateDependant>
                              {children}
                            </RemoteStateDependant>
                            <GlobalStyle />
                            <ExtensionGlobalStyle />
                          </AntDesignThemeProvider>
                        </StorageProvider>
                      </WalletCoreProvider>
                    </I18nProvider>
                  </QueryProvider>
                </ThemeProvider>
              </MpcDeviceProvider>
            </SaveFileProvider>
          </OpenUrlProvider>
        </VaultCreationMpcLibProvider>
      </MpcLocalModeAvailabilityProvider>
    </VersionProvider>
  )
}
