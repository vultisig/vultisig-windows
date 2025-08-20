import { Chain, IbcEnabledCosmosChain, OtherChain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { attempt, withFallback } from '@lib/utils/attempt'

// it's a temporary solution to handle shared requests before we completely migrate to the new communication layer
export const getSharedHandlers = (chain: Chain) => {
  return {
    get_accounts: async () =>
      withFallback(
        attempt(async () => {
          const address = await callBackground({
            getAddress: { chain },
          })

          // for some reason get_accounts was returning a single address for some chains
          // that's why there is this logic, but it worth double-checking that as it seems off
          if (
            isOneOf(chain, [
              OtherChain.Solana,
              ...Object.values(IbcEnabledCosmosChain),
            ])
          ) {
            return address
          }
          return [address]
        }),
        []
      ),
  } as const
}
