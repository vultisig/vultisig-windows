import buildInfo from '@clients/desktop/build.json'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { I18nProvider } from '@core/ui/i18n/I18nProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { MpcLocalModeAvailabilityProvider } from '@core/ui/mpc/state/MpcLocalModeAvailability'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { VersionProvider } from '@core/ui/product/state/version'
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
import { FiatCurrencyProviders } from './preferences/state/fiatCurrency'
import { useLanguage } from './preferences/state/language'
import { getQueryClient } from './query/queryClient'
import { RemoteStateDependant } from './state/RemoteStateDependant'
import { CreateVaultProvider } from './vault/state/createVault'
import {
  CurrentVaultIdProvider,
  SetCurrentVaultIdProvider,
} from './vault/state/currentVaultId'
import { UpdateVaultProvider } from './vault/state/updateVault'

const queryClient = getQueryClient()

const saveFile: SaveFileFunction = async ({ name, blob }) => {
  const arrayBuffer = await blob.arrayBuffer()
  const base64Data = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  )
  await SaveFile(name, base64Data)
}

export const AppProviders = ({ children }: ChildrenProp) => {
  const [language] = useLanguage()
  const [mpcLib] = useVaultCreationMpcLib()

  return (
    <FiatCurrencyProviders>
      <VersionProvider value={buildInfo.version}>
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
                              <CurrentVaultIdProvider>
                                <SetCurrentVaultIdProvider>
                                  <CreateVaultProvider>
                                    <UpdateVaultProvider>
                                      {children}
                                    </UpdateVaultProvider>
                                  </CreateVaultProvider>
                                </SetCurrentVaultIdProvider>
                              </CurrentVaultIdProvider>
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
      </VersionProvider>
    </FiatCurrencyProviders>
  )
}
