import { Chain, CosmosChain } from '@core/chain/Chain'
import { CHAINS_WITH_IBC_TOKENS, IBC_TOKENS } from '@core/chain/coin/ibcTokens'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'

export const useIBCAcceptedTokens = (destinationChain?: Chain) => {
  const coins = useCurrentVaultCoins()

  if (
    !destinationChain ||
    !CHAINS_WITH_IBC_TOKENS.includes(destinationChain as CosmosChain)
  ) {
    return []
  }

  return coins.filter(coin => {
    const isIbcToken = IBC_TOKENS.some(
      ibc =>
        ibc.ticker.toUpperCase() === coin.ticker.toUpperCase() &&
        ibc.decimals === coin.decimals
    )
    return isIbcToken && coin.chain === destinationChain
  })
}
