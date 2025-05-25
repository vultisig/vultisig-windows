import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { MpcLib } from '@core/mpc/mpcLib'
import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProivder'
import { CoreProvider, CoreState } from '@core/ui/state/core'
import { StorageDependant } from '@core/ui/storage/StorageDependant'
import { ActiveVaultOnly } from '@core/ui/vault/ActiveVaultOnly'
import { CoinFinder } from '@core/ui/vault/chain/coin/finder/CoinFinder'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'
import { createGlobalStyle } from 'styled-components'

import { getManifestVersion } from '../state/utils/getManifestVersion'
import { storage } from '../storage'
import { StorageMigrationsManager } from './StorageMigrationManager'

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
  ...storage,
  client: 'extension',
  openUrl: url => window.open(url, '_blank', 'noopener,noreferrer'),
  saveFile: async ({ name, blob }) => {
    initiateFileDownload({ name, blob })
  },
  mpcDevice: 'extension',
  getClipboardText: () => navigator.clipboard.readText(),
  version: getManifestVersion(),
  isLocalModeAvailable: false,
  getMpcServerUrl: async ({ serverType }) => {
    if (serverType === 'relay') {
      return mpcServerUrl.relay
    }

    throw new Error('Local mode is not available in extension')
  },
}

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <ExtensionGlobalStyle />
      <VaultCreationMpcLibProvider value={defaultMpcLib}>
        <CoreProvider value={coreState}>
          <QueryProvider>
            <WalletCoreProvider>
              <StorageMigrationsManager>
                <StorageDependant>
                  <ToastProvider>
                    <ResponsivenessProvider>{children}</ResponsivenessProvider>
                  </ToastProvider>
                  <ActiveVaultOnly>
                    <CoinFinder />
                  </ActiveVaultOnly>
                </StorageDependant>
              </StorageMigrationsManager>
            </WalletCoreProvider>
          </QueryProvider>
        </CoreProvider>
      </VaultCreationMpcLibProvider>
    </ThemeProvider>
  )
}
