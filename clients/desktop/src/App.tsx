import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { VStack } from '@lib/ui/layout/Stack'
import { RouterProvider } from 'react-router-dom'

import { AppProviders } from './AppProviders'
import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly'
import { ToastProvider } from './lib/ui/toast/ToastProvider'
import OnboardingResetter from './onboarding/OnboardingRessetterProvider'
import { router } from './router'
import { RemoteStateDependant } from './state/RemoteStateDependant'

const App = () => {
  return (
    <AppProviders>
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
    </AppProviders>
  )
}

export default App
