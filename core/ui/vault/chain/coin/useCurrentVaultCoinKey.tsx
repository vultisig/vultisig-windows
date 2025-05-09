import { CoinKey } from '@core/chain/coin/Coin'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'

export const useCurrentVaultCoinKey = (): CoinKey => {
  const [{ chain, coin }] = useCorePathState<'vaultChainCoinDetail'>()

  return {
    chain: chain,
    id: coin,
  }
}
