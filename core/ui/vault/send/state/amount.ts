import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'

const getKey = (vaultId?: string) => `send_amount_${vaultId ?? 'unknown'}`

export const { useState: useSendAmount, provider: SendAmountProvider } =
  getPersistentStateProviderSetup<number | null>('SendAmount', getKey)
