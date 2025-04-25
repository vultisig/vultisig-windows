import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { CurrentVaultId } from './currentVaultId'

export type SetCurrentVaultIdFunction = (
  id: CurrentVaultId
) => Promise<void> | void

export const {
  useValue: useSetCurrentVaultId,
  provider: SetCurrentVaultIdProvider,
} = getValueProviderSetup<SetCurrentVaultIdFunction>('SetCurrentVaultId')
