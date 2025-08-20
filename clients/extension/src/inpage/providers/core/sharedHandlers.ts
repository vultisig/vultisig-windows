import { Chain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'

// it's a temporary solution to handle shared requests before we completely migrate to the new communication layer
export const getSharedHandlers = (chain: Chain) => {
  return {
    get_accounts: async () =>
      withFallback(
        attempt(async () => [
          await callBackground({
            getAddress: { chain },
          }),
        ]),
        []
      ),
  } as const
}
