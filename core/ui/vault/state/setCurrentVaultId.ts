import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export type CurrentVaultId = string | null

export type SetCurrentVaultIdFunction = (
  id: CurrentVaultId
) => Promise<void> | void

export const {
  useValue: useSetCurrentVaultId,
  provider: SetCurrentVaultIdProvider,
} = getValueProviderSetup<SetCurrentVaultIdFunction>('SetCurrentVaultId')
