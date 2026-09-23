import { CoreApp } from '@core/ui/CoreApp'
import { StartupMode } from '@core/ui/product/startupSplash'
import { CoreState } from '@core/ui/state/core'
import { ErrorBoundaryProcessError } from '@lib/ui/errors/ErrorBoundary'
import { ChildrenProp } from '@lib/ui/props'
import { mpcServerUrl } from '@vultisig/core-mpc/MpcServerType'
import { initiateFileDownload } from '@vultisig/lib-utils/file/initiateFileDownload'
import { useMemo } from 'react'

import { storage } from './storage'
import { getDeveloperOptions } from './storage/developerOptions'
import { StorageMigrationsManager } from './storage/migrations/StorageMigrationManager'

const openUrl = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// `window.open` focuses the new tab, and the action popup closes as soon as it
// loses focus. An inactive tab leaves the popup, and the flow in it, in place.
const openUrlInBackground = async (url: string) => {
  try {
    await chrome.tabs.create({ url, active: false })
  } catch (error) {
    console.error('Failed to open url in a background tab', error)
    openUrl(url)
  }
}

const baseCoreState: Omit<
  CoreState,
  'goBack' | 'goHome' | 'popNavigationHistory'
> = {
  ...storage,
  client: 'extension',
  openUrl,
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
  getDeveloperOptions,
  vaultCreationMpcLib: 'DKLS',
}

type ExtensionCoreAppProps = ChildrenProp & {
  processError?: ErrorBoundaryProcessError
  goBack: () => void
  goHome: () => void
  popNavigationHistory: (steps: number) => void
  targetVaultId?: string
  isLimited?: boolean
  startupMode?: StartupMode
  isPopup?: boolean
}

/**
 * `CoreApp` wired to the extension's storage, navigation callbacks and
 * migrations. `startupMode` is passed through so the action popup can boot
 * without the splash, and `isPopup` opens external links in background tabs so
 * following one does not close the popup.
 */
export const ExtensionCoreApp = ({
  children,
  processError,
  goBack,
  popNavigationHistory,
  targetVaultId,
  goHome,
  isLimited,
  startupMode,
  isPopup,
}: ExtensionCoreAppProps) => {
  const coreState = useMemo(
    () => ({
      ...baseCoreState,
      processError,
      targetVaultId,
      goBack,
      goHome,
      popNavigationHistory,
      isLimited,
      openUrlInBackground: isPopup ? openUrlInBackground : undefined,
    }),
    [
      processError,
      targetVaultId,
      goBack,
      goHome,
      popNavigationHistory,
      isLimited,
      isPopup,
    ]
  )

  return (
    <CoreApp
      migrationsManager={StorageMigrationsManager}
      coreState={coreState}
      isLimited={isLimited}
      startupMode={startupMode}
    >
      {children}
    </CoreApp>
  )
}
