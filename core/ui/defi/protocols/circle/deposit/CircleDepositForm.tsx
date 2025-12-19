import { Chain } from '@core/chain/Chain'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { usdc } from '@core/chain/coin/knownTokens'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { OnFinishProp } from '@lib/ui/props'

import { CircleAmountForm } from '../shared/CircleAmountForm'

export const CircleDepositForm = ({ onFinish }: OnFinishProp<bigint>) => {
  const address = useCurrentVaultAddress(Chain.Ethereum)
  const balanceQuery = useBalanceQuery(
    extractAccountCoinKey({ ...usdc, address })
  )

  return <CircleAmountForm balanceQuery={balanceQuery} onFinish={onFinish} />
}
