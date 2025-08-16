import buildInfo from '@clients/desktop/build.json'
import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { QueryClientProvider } from '@core/ui/query/QueryClientProvider'
import { CoreState } from '@core/ui/state/core'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
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

const baseCoreState: Omit<CoreState, 'vaultCreationMpcLib'> = {
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

const App = () => {
  const [vaultCreationMpcLib] = useVaultCreationMpcLib()

  const coreState = useMemo(
    () => ({
      ...baseCoreState,
      vaultCreationMpcLib,
    }),
    [vaultCreationMpcLib]
  )

  return (
    <QueryClientProvider persister={queriesPersister}>
      <NavigationProvider initialValue={{ history: [initialCoreView] }}>
        <CoreApp coreState={coreState}>
          <LauncherObserver />
          <ActiveView views={views} />
          <OnboardingResetter />
        </CoreApp>
      </NavigationProvider>
    </QueryClientProvider>
  )
}

export default App
