import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { DepositCoinManager } from '../DepositCoinManager'
import { useDepositAction } from './DepositActionProvider'

export const {
  useState: useDepositCoin,
  provider: InternalDepositCoinProvider,
} = getStateProviderSetup<AccountCoin>('DepositCoin')

export const DepositCoinProvider = ({
  children,
  initialCoin,
}: ChildrenProp & { initialCoin: AccountCoin }) => {
  const [action] = useDepositAction()

  return (
    <InternalDepositCoinProvider initialValue={initialCoin}>
      <DepositCoinManager action={action}>{children}</DepositCoinManager>
    </InternalDepositCoinProvider>
  )
}
