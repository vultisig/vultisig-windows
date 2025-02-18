import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup'

export const { useState: useSendAmount, provider: SendAmountProvider } =
  getStateProviderSetup<number | null>('SendAmount')
