import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { VStack } from '@lib/ui/layout/Stack'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import { RouterProvider } from 'react-router-dom'

import { AppProviders } from './AppProviders'
import { router } from './navigation/router'
import OnboardingResetter from './onboarding/OnboardingRessetterProvider'

const App = () => {
  return (
    <AppProviders>
      <GlobalStyle />
      <VStack fullSize>
        <OnboardingResetter>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </OnboardingResetter>
      </VStack>
    </AppProviders>
  )
}

export default App
