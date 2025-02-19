import { CoinKey } from '@core/chain/coin/Coin'

import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams'

export const useCurrentVaultCoinKey = (): CoinKey => {
  const [{ chain, coin }] = useAppPathParams<'vaultChainCoinDetail'>()

  return {
    chain: chain,
    id: coin,
  }
}
