import { NavigationProvider } from '@core/ui/navigation/NavigationProvider'
import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { VStack } from '@lib/ui/layout/Stack'
import { ActiveRoute } from '@lib/ui/navigation/state'

import { AppProviders } from './AppProviders'
import { ErrorBoundary } from './errors/components/ErrorBoundary'
import { FullSizeErrorFallback } from './errors/components/FullSizeErrorFallback'
import { LauncherObserver } from './launcher/components/LauncherObserver'
import { routes } from './navigation/router'
import OnboardingResetter from './onboarding/OnboardingRessetterProvider'

const App = () => {
  return (
    <AppProviders>
      <GlobalStyle />
      <VStack fullSize>
        <OnboardingResetter>
          <NavigationProvider>
            <ErrorBoundary
              renderFallback={props => <FullSizeErrorFallback {...props} />}
            >
              <LauncherObserver />
              <ActiveRoute routes={routes} />
            </ErrorBoundary>
          </NavigationProvider>
        </OnboardingResetter>
      </VStack>
    </AppProviders>
  )
}

export default App
