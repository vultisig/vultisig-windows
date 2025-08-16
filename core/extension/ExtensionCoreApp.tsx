import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { CoreApp } from '@core/ui/CoreApp'
import { CoreState } from '@core/ui/state/core'
import { ErrorBoundaryProcessError } from '@lib/ui/errors/ErrorBoundary'
import { ChildrenProp } from '@lib/ui/props'
import { initiateFileDownload } from '@lib/ui/utils/initiateFileDownload'
import { useMemo } from 'react'

import { storage } from './storage'
import { StorageMigrationsManager } from './storage/migrations/StorageMigrationManager'

const baseCoreState: Omit<CoreState, 'goBack'> = {
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
  goBack: () => void
}

export const ExtensionCoreApp = ({
  children,
  processError,
  goBack,
}: ExtensionCoreAppProps) => {
  const coreState = useMemo(
    () => ({
      ...baseCoreState,
      processError,
      goBack,
    }),
    [processError, goBack]
  )

  return (
    <CoreApp migrationsManager={StorageMigrationsManager} coreState={coreState}>
      {children}
    </CoreApp>
  )
}
