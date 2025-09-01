import { MpcDevice } from '@core/mpc/devices/MpcDevice'
import { MpcLib } from '@core/mpc/mpcLib'
import { MpcServerType } from '@core/mpc/MpcServerType'
import { ErrorBoundaryProcessError } from '@lib/ui/errors/ErrorBoundary'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { NameProp } from '@lib/utils/entities/props'

import { CoreStorage } from '../storage/CoreStorage'

type SaveFileFunction = (
  input: {
    blob: Blob
  } & NameProp
) => Promise<void>

export type Client = 'desktop' | 'extension'

export type GetMpcServerUrlInput = {
  serverType: MpcServerType
  serviceName: string
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
  processError?: ErrorBoundaryProcessError
  targetVaultId?: string
  goBack: () => void
  goHome: () => void
}

export const { useValue: useCore, provider: CoreProvider } =
  getValueProviderSetup<CoreState>('Core')
