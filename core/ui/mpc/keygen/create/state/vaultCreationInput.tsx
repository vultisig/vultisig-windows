import { getOptionalValueProviderSetup } from '@lib/ui/state/getOptionalValueProviderSetup'

import { VaultCreationInput } from '../VaultCreationInput'

export const {
  useValue: useVaultCreationInput,
  provider: VaultCreationInputProvider,
} = getOptionalValueProviderSetup<VaultCreationInput>()
