import { isExtensionEnv } from '@core/ui/utils/isExtensionEnv'
import { getPersistentStateProviderSetup } from '@core/ui/vault/persistent/getPersistentStateProviderSetup'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

const providerSetup = isExtensionEnv()
  ? getPersistentStateProviderSetup<number | null>(
      'FromAmount',
      (vaultId?: string) => `swap_from_amount_${vaultId}`
    )
  : getStateProviderSetup<number | null>('FromAmount')

export const { useState: useFromAmount, provider: FromAmountProvider } =
  providerSetup
