import { ChildrenProp } from '@lib/ui/props'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { Chain } from '@vultisig/core-chain/Chain'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ChainAction } from '../ChainAction'
import { useAvailableChainActions } from '../hooks/useAvailableChainActions'
import { tronWithdrawExpireUnfreezeAction } from '../tron/withdrawExpireUnfreeze'

export const [InternalDepositActionProvider, useDepositAction] =
  setupStateProvider<ChainAction>('DepositAction')

// Actions opened only from their own screen, never listed in the action picker.
const routeOnlyActions: Partial<Record<Chain, ChainAction>> = {
  [Chain.Tron]: tronWithdrawExpireUnfreezeAction,
  [Chain.THORChain]: 'bond_yield',
}

/** The deposit action to open with: the requested one when the chain offers it, else the chain's first. */
export const resolveInitialDepositAction = ({
  chain,
  preferredAction,
  actions,
}: {
  chain: Chain
  preferredAction?: ChainAction
  actions: ChainAction[]
}): ChainAction => {
  if (
    preferredAction &&
    (actions.includes(preferredAction) ||
      routeOnlyActions[chain] === preferredAction)
  ) {
    return preferredAction
  }
  return actions[0] ?? 'custom'
}

export const DepositActionProvider = ({ children }: ChildrenProp) => {
  const [{ coin: coinKey, action: preferredAction }] =
    useCoreViewState<'deposit'>()
  const actions = useAvailableChainActions(coinKey.chain)

  const initialAction = resolveInitialDepositAction({
    chain: coinKey.chain,
    preferredAction,
    actions,
  })

  return (
    <InternalDepositActionProvider initialValue={initialAction}>
      {children}
    </InternalDepositActionProvider>
  )
}
