import buildInfo from '@clients/desktop/build.json'
import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { useProcessAppError } from '@core/ui/errors/hooks/useProcessAppError'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { QueryClientProvider } from '@core/ui/query/QueryClientProvider'
import { CoreState } from '@core/ui/state/core'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { BrowserOpenURL, ClipboardGetText } from '@wailsapp/runtime'
import { useMemo } from 'react'

import { SaveFile } from '../wailsjs/go/main/App'
import { DiscoveryService } from '../wailsjs/go/mediator/Server'
import { LauncherObserver } from './launcher/components/LauncherObserver'
import { useVaultCreationMpcLib } from './mpc/state/vaultCreationMpcLib'
import { views } from './navigation/views'
import { OnboardingResetter } from './onboarding/OnboardingResetter'
import { storage } from './storage'
import { queriesPersister } from './storage/queriesPersister'

const baseCoreState: Omit<
  CoreState,
  'vaultCreationMpcLib' | 'goBack' | 'goHome'
> = {
  ...storage,
  client: 'desktop',
  openUrl: BrowserOpenURL,
  saveFile: async ({ name, blob }) => {
    const arrayBuffer = await blob.arrayBuffer()
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )
    await SaveFile(name, base64Data)
  },
  mpcDevice: 'windows',
  getClipboardText: ClipboardGetText,
  version: buildInfo.version,
  isLocalModeAvailable: true,
  getMpcServerUrl: async ({ serverType, serviceName }) => {
    if (serverType === 'relay') {
      return mpcServerUrl.relay
    }

    return DiscoveryService(serviceName)
  },
}

const AppContent = () => {
  const [vaultCreationMpcLib] = useVaultCreationMpcLib()
  const processError = useProcessAppError()
  const goBack = useNavigateBack()
  const navigate = useNavigate()

  const coreState = useMemo(
    () => ({
      ...baseCoreState,
      vaultCreationMpcLib,
      processError,
      goBack,
      goHome: () => navigate(initialCoreView),
    }),
    [vaultCreationMpcLib, processError, goBack, navigate]
  )

  return (
    <CoreApp coreState={coreState}>
      <LauncherObserver />
      <ActiveView views={views} />
      <OnboardingResetter />
    </CoreApp>
  )
}

const App = () => {
  return (
    <QueryClientProvider persister={queriesPersister}>
      <NavigationProvider initialValue={{ history: [initialCoreView] }}>
        <AppContent />
      </NavigationProvider>
    </QueryClientProvider>
  )
}

export default App
