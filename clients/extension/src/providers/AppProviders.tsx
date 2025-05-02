import { I18nProvider } from '@clients/extension/src/providers/I18nProvider'
import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { MpcLib } from '@core/mpc/mpcLib'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { MpcLocalModeAvailabilityProvider } from '@core/ui/mpc/state/MpcLocalModeAvailability'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { VersionProvider } from '@core/ui/product/state/version'
import { CoreState } from '@core/ui/state/core'
import { StorageDependant } from '@core/ui/storage/StorageDependant'
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
    max-width: 1024px;
    min-height: 600px;
    min-width: 400px;
    overflow: hidden;
    width: 100%;
  }
`

const defaultMpcLib: MpcLib = 'DKLS'

const coreState: CoreState = {
  openUrl: url => window.open(url, '_blank'),
  saveFile: async ({ name, blob }) => {
    initiateFileDownload({ name, blob })
  },
  mpcDevice: 'extension',
  getClipboardText: () => navigator.clipboard.readText(),
}

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <ExtensionGlobalStyle />
      <VersionProvider value="1.0.0">
        <MpcLocalModeAvailabilityProvider value={false}>
          <VaultCreationMpcLibProvider value={defaultMpcLib}>
            <OpenUrlProvider value={openUrl}>
              <SaveFileProvider value={saveFile}>
                <MpcDeviceProvider value="extension">
                  <QueryProvider>
                    <I18nProvider>
                      <WalletCoreProvider>
                        <StorageProvider>
                          <StorageDependant>{children}</StorageDependant>
                        </StorageProvider>
                      </WalletCoreProvider>
                    </I18nProvider>
                  </QueryProvider>
                </MpcDeviceProvider>
              </SaveFileProvider>
            </OpenUrlProvider>
          </VaultCreationMpcLibProvider>
        </MpcLocalModeAvailabilityProvider>
      </VersionProvider>
    </ThemeProvider>
  )
}
