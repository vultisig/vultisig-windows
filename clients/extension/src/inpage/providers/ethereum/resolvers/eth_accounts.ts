import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'

import { getChain } from '../utils'

export const getEthAccounts = async (): Promise<string[]> =>
  withFallback(
    attempt(async () => {
      const chain = await getChain()

      const { address } = await callBackground({
        getAccount: { chain },
      })

      return [address]
    }),
    []
  )
