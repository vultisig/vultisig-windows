import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'

const getKey = (vaultId?: string) => `send_receiver_${vaultId}`

export const { useState: useSendReceiver, provider: SendReceiverProvider } =
  getPersistentStateProviderSetup<string>('SendReceiver', getKey)
