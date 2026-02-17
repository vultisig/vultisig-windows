import { setupOptionalValueProvider } from '@lib/ui/state/setupOptionalValueProvider'

import { VaultCreationInput } from '../VaultCreationInput'

export const [VaultCreationInputProvider, useVaultCreationInput] =
  setupOptionalValueProvider<VaultCreationInput>()
