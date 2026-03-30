import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { OnFinishProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'

import { CircleAmountForm } from '../shared/CircleAmountForm'

export const CircleDepositForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const address = useCurrentVaultAddress(Chain.Ethereum)
  const balanceQuery = useBalanceQuery(
    extractAccountCoinKey({ ...usdc, address })
  )

  return <CircleAmountForm balanceQuery={balanceQuery} onFinish={onFinish} />
}
