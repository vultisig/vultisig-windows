import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

type SetCurrentVaultIdFunction = (id: string | null) => Promise<void> | void

export const {
  useValue: useSetCurrentVaultId,
  provider: SetCurrentVaultIdProvider,
} = getValueProviderSetup<SetCurrentVaultIdFunction>('SetCurrentVaultId')
