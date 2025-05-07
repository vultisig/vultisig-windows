import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { MpcLib } from '@core/mpc/mpcLib'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { I18nProvider } from '@core/ui/i18n/I18nProvider'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { CoreProvider, CoreState } from '@core/ui/state/core'
import { StorageDependant } from '@core/ui/storage/StorageDependant'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'
import { createGlobalStyle } from 'styled-components'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import { storage } from '../state/storage'

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
  openUrl: url => window.open(url, '_blank', 'noopener,noreferrer'),
  saveFile: async ({ name, blob }) => {
    initiateFileDownload({ name, blob })
  },
  mpcDevice: 'extension',
  getClipboardText: () => navigator.clipboard.readText(),
  version: '1.0.0',
  isLocalModeAvailable: false,
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
              <StorageDependant>
                <ToastProvider>
                  <I18nProvider>{children}</I18nProvider>
                </ToastProvider>
              </StorageDependant>
            </WalletCoreProvider>
          </QueryProvider>
        </CoreProvider>
      </VaultCreationMpcLibProvider>
    </ThemeProvider>
  )
}
