import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ChainAction } from '../ChainAction'
import { useAvailableChainActions } from '../hooks/useAvailableChainActions'

export const {
  useState: useDepositAction,
  provider: InternalDepositActionProvider,
} = getStateProviderSetup<ChainAction>('DepositAction')

export const DepositActionProvider = ({ children }: ChildrenProp) => {
  const [{ coin: coinKey, action }] = useCoreViewState<'deposit'>()
  const actions = useAvailableChainActions(coinKey.chain)
  const initial =
    (action && actions.includes(action) && action) || actions[0] || undefined

  return (
    <InternalDepositActionProvider initialValue={initial}>
      {children}
    </InternalDepositActionProvider>
  )
}
