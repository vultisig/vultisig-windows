import { rootApiUrl } from '@core/config'
import { memoize } from '@lib/utils/memoize'
import { Connection } from '@solana/web3.js'

export const solanaRpcUrl = `${rootApiUrl}/solana/`

export const getSolanaClient = memoize(() => {
  return new Connection(solanaRpcUrl)
})
