import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useSendAmount, provider: SendAmountProvider } =
  getStateProviderSetup<bigint | null>('SendAmount')
