import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { CoreState } from '@core/ui/state/core'
import { ErrorBoundaryProcessError } from '@lib/ui/errors/ErrorBoundary'
import { ChildrenProp } from '@lib/ui/props'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'

import { storage } from './storage'
import { StorageMigrationsManager } from './storage/migrations/StorageMigrationManager'

const coreState: CoreState = {
  ...storage,
  client: 'extension',
  openUrl: url => window.open(url, '_blank', 'noopener,noreferrer'),
  saveFile: async ({ name, blob }) => {
    initiateFileDownload({ name, blob })
  },
  mpcDevice: 'extension',
  getClipboardText: () => navigator.clipboard.readText(),
  version: chrome.runtime.getManifest().version,
  isLocalModeAvailable: false,
  getMpcServerUrl: async ({ serverType }) => {
    if (serverType === 'relay') {
      return mpcServerUrl.relay
    }

    throw new Error('Local mode is not available in extension')
  },
  vaultCreationMpcLib: 'DKLS',
}

type ExtensionCoreAppProps = ChildrenProp & {
  processError?: ErrorBoundaryProcessError
}

export const ExtensionCoreApp = ({
  children,
  processError,
}: ExtensionCoreAppProps) => (
  <CoreApp
    migrationsManager={StorageMigrationsManager}
    coreState={coreState}
    processError={processError}
  >
    {children}
  </CoreApp>
)
