import buildInfo from '@clients/desktop/build.json'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { I18nProvider } from '@core/ui/i18n/I18nProvider'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { CoreProvider, CoreState } from '@core/ui/state/core'
import { StorageDependant } from '@core/ui/storage/StorageDependant'
import { ActiveVaultOnly } from '@core/ui/vault/ActiveVaultOnly'
import { CoinFinder } from '@core/ui/vault/chain/coin/finder/CoinFinder'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserOpenURL, ClipboardGetText } from '@wailsapp/runtime'

import { SaveFile } from '../wailsjs/go/main/App'
import { useVaultCreationMpcLib } from './mpc/state/vaultCreationMpcLib'
import { getQueryClient } from './query/queryClient'
import { storage } from './state/storage'

const queryClient = getQueryClient()

const coreState: CoreState = {
  ...storage,
  openUrl: BrowserOpenURL,
  saveFile: async ({ name, blob }) => {
    const arrayBuffer = await blob.arrayBuffer()
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )
    await SaveFile(name, base64Data)
  },
  mpcDevice: 'windows',
  getClipboardText: ClipboardGetText,
  version: buildInfo.version,
  isLocalModeAvailable: true,
}

export const AppProviders = ({ children }: ChildrenProp) => {
  const [mpcLib] = useVaultCreationMpcLib()

  return (
    <VaultCreationMpcLibProvider value={mpcLib}>
      <CoreProvider value={coreState}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={darkTheme}>
            <WalletCoreProvider>
              <StorageDependant>
                <I18nProvider>
                  <ToastProvider>
                    {children}
                    <ActiveVaultOnly>
                      <CoinFinder />
                    </ActiveVaultOnly>
                  </ToastProvider>
                </I18nProvider>
              </StorageDependant>
            </WalletCoreProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </CoreProvider>
    </VaultCreationMpcLibProvider>
  )
}
