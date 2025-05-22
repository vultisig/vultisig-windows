import { MpcDevice } from '@core/mpc/devices/MpcDevice'
import { MpcServerType } from '@core/mpc/MpcServerType'
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
  getClipboardText: () => Promise<string>
  version: string
  isLocalModeAvailable: boolean
  getMpcServerUrl: (input: GetMpcServerUrlInput) => Promise<string>
}

export const { useValue: useCore, provider: CoreProvider } =
  getValueProviderSetup<CoreState>('Core')
