import { Chain, CosmosChain } from '@core/chain/Chain'
import { CHAINS_WITH_IBC_TOKENS, IBC_TOKENS } from '@core/chain/coin/ibc'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'

export const useIBCAcceptedTokens = (destinationChain?: Chain) => {
  const coins = useCurrentVaultCoins()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()

  if (
    !destinationChain ||
    !CHAINS_WITH_IBC_TOKENS.includes(destinationChain as CosmosChain)
  ) {
    return []
  }

  return withoutDuplicates(
    coins.filter(coin => {
      const isIbcToken = IBC_TOKENS.some(
        ibc =>
          ibc.ticker.toUpperCase() === coin.ticker.toUpperCase() &&
          ibc.decimals === coin.decimals &&
          coin.chain === coinKey.chain
      )
      return isIbcToken
    }),
    (tokenA, tokenB) =>
      tokenA.ticker.toUpperCase() === tokenB.ticker.toUpperCase()
  )
}
