import { VStack } from '@lib/ui/layout/Stack'
import { ActiveView } from '@lib/ui/navigation/ActiveView'

import { AppProviders } from './AppProviders'
import { LauncherObserver } from './launcher/components/LauncherObserver'
import { views } from './navigation/views'
import { OnboardingResetter } from './onboarding/OnboardingResetter'

const App = () => {
  return (
    <AppProviders>
      <VStack fullSize>
        <LauncherObserver />
        <ActiveView views={views} />
        <OnboardingResetter />
      </VStack>
    </AppProviders>
  )
}

export default App
