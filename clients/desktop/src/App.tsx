import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { I18nProvider } from '@core/ui/i18n/I18nProvider'
import { MpcDeviceProvider } from '@core/ui/mpc/state/mpcDevice'
import { VaultCreationMpcLibProvider } from '@core/ui/mpc/state/vaultCreationMpcLib'
import { OpenUrlProvider } from '@core/ui/state/openUrl'
import { SaveFileFunction, SaveFileProvider } from '@core/ui/state/saveFile'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { VStack } from '@lib/ui/layout/Stack'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserOpenURL } from '@wailsapp/runtime'
import { RouterProvider } from 'react-router-dom'

import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly'
import { ToastProvider } from './lib/ui/toast/ToastProvider'
import { useVaultCreationMpcLib } from './mpc/state/vaultCreationMpcLib'
import OnboardingResetter from './onboarding/OnboardingRessetterProvider'
import { useLanguage } from './preferences/state/language'
import { getQueryClient } from './query/queryClient'
import { router } from './router'
import { RemoteStateDependant } from './state/RemoteStateDependant'
import { SaveFile } from './wailsjs/go/main/App'

const queryClient = getQueryClient()

const saveFile: SaveFileFunction = async ({ name, value }) => {
  await SaveFile(name, value)
}

const App = () => {
  const [language] = useLanguage()
  const [mpcLib] = useVaultCreationMpcLib()

  return (
    <VaultCreationMpcLibProvider value={mpcLib}>
      <OpenUrlProvider value={BrowserOpenURL}>
        <SaveFileProvider value={saveFile}>
          <MpcDeviceProvider value="windows">
            <WalletCoreProvider>
              <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={darkTheme}>
                  <I18nProvider language={language}>
                    <GlobalStyle />
                    <VStack fullSize>
                      <RemoteStateDependant>
                        <InitializedWalletOnly>
                          <OnboardingResetter>
                            <ToastProvider>
                              <RouterProvider router={router} />
                            </ToastProvider>
                          </OnboardingResetter>
                        </InitializedWalletOnly>
                      </RemoteStateDependant>
                    </VStack>
                  </I18nProvider>
                </ThemeProvider>
              </QueryClientProvider>
            </WalletCoreProvider>
          </MpcDeviceProvider>
        </SaveFileProvider>
      </OpenUrlProvider>
    </VaultCreationMpcLibProvider>
  )
}

export default App
