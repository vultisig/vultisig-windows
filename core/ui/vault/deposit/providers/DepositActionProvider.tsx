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
  const [{ coin: coinKey, action: preferredAction }] =
    useCoreViewState<'deposit'>()
  const actions = useAvailableChainActions(coinKey.chain)

  const initialAction =
    (preferredAction && actions.includes(preferredAction)
      ? preferredAction
      : actions[0]) ?? 'custom'

  return (
    <InternalDepositActionProvider initialValue={initialAction}>
      {children}
    </InternalDepositActionProvider>
  )
}
