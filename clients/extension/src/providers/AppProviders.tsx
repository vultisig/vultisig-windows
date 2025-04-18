import { AntDesignThemeProvider } from '@clients/extension/src/providers/AntDesignThemeProvider'
import { I18nProvider } from '@clients/extension/src/providers/I18nProvider'
import { QueryProvider } from '@clients/extension/src/providers/QueryClientProvider'
import { defaultMpcLib } from '@core/mpc/mpcLib'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { MpcLocalModeAvailabilityProvider } from '@core/ui/mpc/state/MpcLocalModeAvailability'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { OpenUrlProvider } from '@core/ui/state/openUrl'
import { SaveFileFunction, SaveFileProvider } from '@core/ui/state/saveFile'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { ChildrenProp } from '@lib/ui/props'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'

import { CreateVaultProvider } from '../vault/state/createVault'
import { SetCurrentVaultIdProvider } from '../vault/state/setCurrentVaultId'
import { UpdateVaultProvider } from '../vault/state/updateVault'
import { RemoteStateDependant } from './RemoteStateDependant'

const openUrl = (url: string) => window.open(url, '_blank')

const saveFile: SaveFileFunction = async ({ name, blob }) => {
  initiateFileDownload({ name, blob })
}

export const AppProviders = ({ children }: ChildrenProp) => {
  return (
    <MpcLocalModeAvailabilityProvider value={false}>
      <VaultCreationMpcLibProvider value={defaultMpcLib}>
        <OpenUrlProvider value={openUrl}>
          <SaveFileProvider value={saveFile}>
            <MpcDeviceProvider value="extension">
              <ThemeProvider theme={darkTheme}>
                <QueryProvider>
                  <I18nProvider>
                    <WalletCoreProvider>
                      <SetCurrentVaultIdProvider>
                        <CreateVaultProvider>
                          <UpdateVaultProvider>
                            <AntDesignThemeProvider>
                              <RemoteStateDependant>
                                {children}
                              </RemoteStateDependant>
                              <GlobalStyle />
                            </AntDesignThemeProvider>
                          </UpdateVaultProvider>
                        </CreateVaultProvider>
                      </SetCurrentVaultIdProvider>
                    </WalletCoreProvider>
                  </I18nProvider>
                </QueryProvider>
              </ThemeProvider>
            </MpcDeviceProvider>
          </SaveFileProvider>
        </OpenUrlProvider>
      </VaultCreationMpcLibProvider>
    </MpcLocalModeAvailabilityProvider>
  )
}
