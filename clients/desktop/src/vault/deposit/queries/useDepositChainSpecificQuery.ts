import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'

import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery'
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin'

export const useDepositChainSpecificQuery = () => {
  const [coinKey] = useCurrentDepositCoin()
  const coin = useCurrentVaultCoin(coinKey)

  return useChainSpecificQuery({
    coin,
    isDeposit: true,
  })
}
