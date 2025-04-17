import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { NameProp } from '@lib/utils/entities/props'

export type SaveFileFunction = (
  input: {
    blob: Blob
  } & NameProp
) => Promise<void>

export const { useValue: useSaveFile, provider: SaveFileProvider } =
  getValueProviderSetup<SaveFileFunction>('SaveFile')
