import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

type SetCurrentVaultIdFunction = (
  id: string | null
) => Promise<unknown> | unknown

export const {
  useValue: useSetCurrentVaultId,
  provider: SetCurrentVaultIdProvider,
} = getValueProviderSetup<SetCurrentVaultIdFunction>('SetCurrentVaultId')
