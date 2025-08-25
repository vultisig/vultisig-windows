import { Chain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'

import { requestAccount } from './requestAccount'

// it's a temporary solution to handle shared requests before we completely migrate to the new communication layer
export const getSharedHandlers = (chain: Chain) => {
  return {
    get_accounts: async () =>
      withFallback(
        attempt(async () => {
          const { address } = await callBackground({
            getAccount: { chain },
          })

          return [address]
        }),
        []
      ),
    request_accounts: async () => {
      const { address } = await requestAccount(chain)

      return [address]
    },
  } as const
}
