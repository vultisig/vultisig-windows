import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'

import { EthereumResolver } from '../resolver'
import { getChain } from '../utils'

export const getEthAccounts: EthereumResolver<void, string[]> = async () =>
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
