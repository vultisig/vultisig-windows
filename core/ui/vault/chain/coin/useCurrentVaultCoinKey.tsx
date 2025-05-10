import { CoinKey } from '@core/chain/coin/Coin'
import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'

export const useCurrentVaultCoinKey = (): CoinKey => {
  const [{ chain, coin }] = useCorePathParams<'vaultChainCoinDetail'>()

  return {
    chain: chain,
    id: coin,
  }
}
