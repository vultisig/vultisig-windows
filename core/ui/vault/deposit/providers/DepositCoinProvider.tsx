import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: useDepositCoin, provider: DepositCoinProvider } =
  getStateProviderSetup<AccountCoin>('DepositCoin')
