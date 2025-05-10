import { GlobalStyle } from '@lib/ui/css/GlobalStyle'
import { VStack } from '@lib/ui/layout/Stack'
import { ActiveView } from '@lib/ui/navigation/ActiveView'

import { AppProviders } from './AppProviders'
import { ErrorBoundary } from './errors/components/ErrorBoundary'
import { FullSizeErrorFallback } from './errors/components/FullSizeErrorFallback'
import { LauncherObserver } from './launcher/components/LauncherObserver'
import { views } from './navigation/views'
import { OnboardingResetter } from './onboarding/OnboardingResetter'

const App = () => {
  return (
    <AppProviders>
      <GlobalStyle />
      <VStack fullSize>
        <ErrorBoundary
          renderFallback={props => <FullSizeErrorFallback {...props} />}
        >
          <LauncherObserver />
          <ActiveView views={views} />
          <OnboardingResetter />
        </ErrorBoundary>
      </VStack>
    </AppProviders>
  )
}

export default App
