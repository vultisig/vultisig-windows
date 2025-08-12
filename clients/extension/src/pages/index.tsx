import { views } from '@clients/extension/src/navigation/views'
import { getManifestVersion } from '@clients/extension/src/state/utils/getManifestVersion'
import { storage } from '@clients/extension/src/storage'
import { StorageMigrationsManager } from '@clients/extension/src/storage/migrations/StorageMigrationManager'
import { isPopupView } from '@clients/extension/src/utils/functions'
import { queriesPersister } from '@core/extension/storage/queriesPersister'
import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { CoreState } from '@core/ui/state/core'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createGlobalStyle, css } from 'styled-components'

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

const isPopup = isPopupView()

const ExtensionGlobalStyle = createGlobalStyle`
  body {
    min-height: 600px;
    min-width: 400px;
    overflow: hidden;

    ${
      !isPopup &&
      css`
        margin: 0 auto;
        max-width: 1024px;
        width: 100%;
      `
    }
  }
`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionGlobalStyle />
    <CoreApp
      migrationsManager={StorageMigrationsManager}
      coreState={coreState}
      queriesPersister={queriesPersister}
    >
      <ActiveView views={views} />
    </CoreApp>
  </StrictMode>
)
