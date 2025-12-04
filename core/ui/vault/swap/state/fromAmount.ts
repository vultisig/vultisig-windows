import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useFromAmount, provider: FromAmountProvider } =
  getStateProviderSetup<bigint | null>('FromAmount')
