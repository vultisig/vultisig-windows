import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { NameProp } from '@lib/utils/entities/props'

export type SaveFileFunction = (
  input: {
    type: string
    value: string
  } & NameProp
) => Promise<void>

export const { useValue: useSaveFile, provider: SaveFileProvider } =
  getValueProviderSetup<SaveFileFunction>('SaveFile')
