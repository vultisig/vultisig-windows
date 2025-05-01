import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'

import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery'
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin'

export const useDepositChainSpecificQuery = (
  transactionType?: TransactionType
) => {
  const [coinKey] = useCurrentDepositCoin()
  const coin = useCurrentVaultCoin(coinKey)

  return useChainSpecificQuery({
    coin,
    isDeposit: true,
    transactionType,
  })
}
