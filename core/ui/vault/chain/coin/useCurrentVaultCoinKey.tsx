import { CoinKey } from '@core/chain/coin/Coin'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

export const useCurrentVaultCoinKey = (): CoinKey => {
  const [{ chain, coin }] = useCoreViewState<'vaultChainCoinDetail'>()

  return {
    chain: chain,
    id: coin,
  }
}
