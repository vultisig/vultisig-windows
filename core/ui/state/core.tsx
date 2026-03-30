import { ErrorBoundaryProcessError } from '@lib/ui/errors/ErrorBoundary'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { MpcDevice } from '@vultisig/core-mpc/devices/MpcDevice'
import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import { MpcServerType } from '@vultisig/core-mpc/MpcServerType'
import { NameProp } from '@vultisig/lib-utils/entities/props'

import { CoreStorage } from '../storage/CoreStorage'

type SaveFileFunction = (
  input: {
    blob: Blob
  } & NameProp
) => Promise<void>

type Client = 'desktop' | 'extension'

export type GetMpcServerUrlInput = {
  serverType: MpcServerType
  serviceName: string
}

type DeveloperOptions = {
  pluginMarketplaceBaseUrl: string
  appInstallTimeout: number
}

export type CoreState = CoreStorage & {
  client: Client
  openUrl: (url: string) => void
  saveFile: SaveFileFunction
  mpcDevice: MpcDevice
  vaultCreationMpcLib: MpcLib
  getClipboardText: () => Promise<string>
  version: string
  isLocalModeAvailable: boolean
  getMpcServerUrl: (input: GetMpcServerUrlInput) => Promise<string>
  getDeveloperOptions?: () => Promise<DeveloperOptions>
  processError?: ErrorBoundaryProcessError
  targetVaultId?: string
  isLimited?: boolean
  goBack: () => void
  popNavigationHistory: (steps: number) => void
  goHome: () => void
}

export const [CoreProvider, useCore] = setupValueProvider<CoreState>('Core')
