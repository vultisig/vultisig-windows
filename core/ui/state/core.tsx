import { MpcDevice } from '@core/mpc/devices/MpcDevice'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { NameProp } from '@lib/utils/entities/props'

type SaveFileFunction = (
  input: {
    blob: Blob
  } & NameProp
) => Promise<void>

export type CoreState = {
  openUrl: (url: string) => void
  saveFile: SaveFileFunction
  mpcDevice: MpcDevice
  getClipboardText: () => Promise<string>
}

export const { useValue: useCore, provider: CoreProvider } =
  getValueProviderSetup<CoreState>('Core')
