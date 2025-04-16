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
import { useVaultCreationMpcLib } from './mpc/state/vaultCreationMpcLib'
import { useLanguage } from './preferences/state/language'
import { getQueryClient } from './query/queryClient'
import { CreateVaultProvider } from './vault/state/createVault'
import { SetCurrentVaultIdProvider } from './vault/state/setCurrentVaultId'

const queryClient = getQueryClient()

const saveFile: SaveFileFunction = async ({ name, value }) => {
  await SaveFile(name, value)
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
                      <CreateVaultProvider>
                        <SetCurrentVaultIdProvider>
                          {children}
                        </SetCurrentVaultIdProvider>
                      </CreateVaultProvider>
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
