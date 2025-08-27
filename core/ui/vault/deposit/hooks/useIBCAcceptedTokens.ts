import { Chain, IbcEnabledCosmosChain } from '@core/chain/Chain'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { useCurrentVaultChainCoins } from '@core/ui/vault/state/currentVaultCoins'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useMemo } from 'react'

import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useIBCAcceptedTokens = (destinationChain?: Chain) => {
  const [{ chain }] = useDepositCoin()
  const sourceCoins = useCurrentVaultChainCoins(chain)

  return useMemo(() => {
    if (
      !destinationChain ||
      !isOneOf(destinationChain, Object.values(IbcEnabledCosmosChain))
    ) {
      return []
    }

    const ibcTokens = Object.values(IbcEnabledCosmosChain).flatMap(chain =>
      knownTokens[chain].filter(coin => coin.id?.startsWith('ibc/'))
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
