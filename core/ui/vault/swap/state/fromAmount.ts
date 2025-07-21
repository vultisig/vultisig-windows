import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'

const getKey = (vaultId?: string) => `swap_from_amount_${vaultId}`

export const { useState: useFromAmount, provider: FromAmountProvider } =
  getPersistentStateProviderSetup<number | null>('FromAmount', getKey)
