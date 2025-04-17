import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { I18nProvider } from '@core/ui/i18n/I18nProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { MpcLocalModeAvailabilityProvider } from '@core/ui/mpc/state/MpcLocalModeAvailability'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { OpenUrlProvider } from '@core/ui/state/openUrl'
import { SaveFileFunction, SaveFileProvider } from '@core/ui/state/saveFile'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserOpenURL } from '@wailsapp/runtime'

import { SaveFile } from '../wailsjs/go/main/App'
import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly'
import { useVaultCreationMpcLib } from './mpc/state/vaultCreationMpcLib'
import { useLanguage } from './preferences/state/language'
import { getQueryClient } from './query/queryClient'
import { RemoteStateDependant } from './state/RemoteStateDependant'
import { CreateVaultProvider } from './vault/state/createVault'
import { SetCurrentVaultIdProvider } from './vault/state/setCurrentVaultId'
import { UpdateVaultProvider } from './vault/state/updateVault'

const queryClient = getQueryClient()

const saveFile: SaveFileFunction = async ({ name, blob }) => {
  // Convert Blob to ArrayBuffer then to base64 for binary safety
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // Convert to base64 for safe transfer to Go
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  const base64Data = btoa(binary)

  await SaveFile(name, base64Data)
}

export const AppProviders = ({ children }: ChildrenProp) => {
  const [language] = useLanguage()
  const [mpcLib] = useVaultCreationMpcLib()

  return (
    <MpcLocalModeAvailabilityProvider value={true}>
      <VaultCreationMpcLibProvider value={mpcLib}>
        <OpenUrlProvider value={BrowserOpenURL}>
          <SaveFileProvider value={saveFile}>
            <MpcDeviceProvider value="windows">
              <WalletCoreProvider>
                <QueryClientProvider client={queryClient}>
                  <ThemeProvider theme={darkTheme}>
                    <I18nProvider language={language}>
                      <InitializedWalletOnly>
                        <RemoteStateDependant>
                          <SetCurrentVaultIdProvider>
                            <CreateVaultProvider>
                              <UpdateVaultProvider>
                                {children}
                              </UpdateVaultProvider>
                            </CreateVaultProvider>
                          </SetCurrentVaultIdProvider>
                        </RemoteStateDependant>
                      </InitializedWalletOnly>
                    </I18nProvider>
                  </ThemeProvider>
                </QueryClientProvider>
              </WalletCoreProvider>
            </MpcDeviceProvider>
          </SaveFileProvider>
        </OpenUrlProvider>
      </VaultCreationMpcLibProvider>
    </MpcLocalModeAvailabilityProvider>
  )
}
