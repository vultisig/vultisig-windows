import { MpcDevice } from '@core/mpc/devices/MpcDevice'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { NameProp } from '@lib/utils/entities/props'

import { CoreStorage } from '../storage/CoreStorage'

type SaveFileFunction = (
  input: {
    blob: Blob
  } & NameProp
) => Promise<void>

export type CoreState = CoreStorage & {
  openUrl: (url: string) => void
  saveFile: SaveFileFunction
  mpcDevice: MpcDevice
  getClipboardText: () => Promise<string>
  version: string
  isLocalModeAvailable: boolean
}

export const { useValue: useCore, provider: CoreProvider } =
  getValueProviderSetup<CoreState>('Core')
