import { Chain, IbcEnabledCosmosChain } from '@core/chain/Chain'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useMemo } from 'react'

export const useIBCAcceptedTokens = (destinationChain?: Chain) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const sourceCoins = useCurrentVaultChainCoins(coinKey.chain)

  return useMemo(() => {
    if (
      !destinationChain ||
      !isOneOf(destinationChain, Object.values(IbcEnabledCosmosChain))
    ) {
      return []
    }

    const ibcTokens = Object.values(IbcEnabledCosmosChain).flatMap(chain =>
      chainTokens[chain].filter(coin => coin.id.startsWith('ibc/'))
    )

    return sourceCoins.filter(coin =>
      ibcTokens.some(
        ibc =>
          ibc.ticker.toUpperCase() === coin.ticker.toUpperCase() &&
          ibc.decimals === coin.decimals
      )
    )
  }, [sourceCoins, destinationChain])
}
