import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useSendReceiver, provider: SendReceiverProvider } =
  getStateProviderSetup<string>('SendReceiver')
