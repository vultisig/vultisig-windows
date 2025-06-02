import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { CoreState } from '@core/ui/state/core'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { queryKeyHashFn } from '@lib/ui/query/utils/queryKeyHashFn'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'
import { QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createGlobalStyle } from 'styled-components'

import { views } from '../navigation/views'
import { StorageMigrationsManager } from '../providers/StorageMigrationManager'
import { getManifestVersion } from '../state/utils/getManifestVersion'
import { storage } from '../storage'

const coreState: CoreState = {
  ...storage,
  client: 'extension',
  openUrl: url => window.open(url, '_blank', 'noopener,noreferrer'),
  saveFile: async ({ name, blob }) => {
    initiateFileDownload({ name, blob })
  },
  mpcDevice: 'extension',
  getClipboardText: () => navigator.clipboard.readText(),
  version: getManifestVersion(),
  isLocalModeAvailable: false,
  getMpcServerUrl: async ({ serverType }) => {
    if (serverType === 'relay') {
      return mpcServerUrl.relay
    }

    throw new Error('Local mode is not available in extension')
  },
  vaultCreationMpcLib: 'DKLS',
}

const ExtensionGlobalStyle = createGlobalStyle`
  body {
    margin: 0 auto;
    max-width: 1024px;
    min-height: 600px;
    min-width: 400px;
    overflow: hidden;
    width: 100%;
  }
`

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionGlobalStyle />
    <CoreApp
      migrationsManager={StorageMigrationsManager}
      coreState={coreState}
      queryClient={queryClient}
    >
      <ActiveView views={views} />
    </CoreApp>
  </StrictMode>
)
