import { Chain, CosmosChain } from '@core/chain/Chain'
import { coinKeyFromString } from '@core/chain/coin/Coin'
import { CHAINS_WITH_IBC_TOKENS, IBC_TOKENS } from '@core/chain/coin/ibc'
import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'

export const useIBCAcceptedTokens = (destinationChain?: Chain) => {
  const coins = useCurrentVaultCoins()
  const [{ coin: coinName }] = useCorePathParams<'deposit'>()
  const { chain: chain } = coinKeyFromString(coinName)

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
          coin.chain === chain
      )
      return isIbcToken
    }),
    (tokenA, tokenB) =>
      tokenA.ticker.toUpperCase() === tokenB.ticker.toUpperCase()
  )
}
