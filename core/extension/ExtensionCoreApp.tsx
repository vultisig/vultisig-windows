import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { CoreState } from '@core/ui/state/core'
import { ChildrenProp } from '@lib/ui/props'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'

import { storage } from './storage'
import { StorageMigrationsManager } from './storage/migrations/StorageMigrationManager'
import { queriesPersister } from './storage/queriesPersister'

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

export const ExtensionCoreApp = ({ children }: ChildrenProp) => {
  return (
    <CoreApp
      migrationsManager={StorageMigrationsManager}
      coreState={coreState}
      queriesPersister={queriesPersister}
    >
      {children}
    </CoreApp>
  )
}
