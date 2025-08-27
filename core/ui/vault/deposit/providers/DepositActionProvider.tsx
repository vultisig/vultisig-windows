import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { ChainAction } from '../ChainAction'

export const { useState: useDepositAction, provider: DepositActionProvider } =
  getStateProviderSetup<ChainAction>('DepositAction')
