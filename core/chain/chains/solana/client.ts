import { rootApiUrl } from '@core/config'
import { memoize } from '@lib/utils/memoize'
import { createSolanaRpc } from '@solana/web3.js'

export const solanaRpcUrl = `${rootApiUrl}/solana/`

export const getSolanaClient = memoize(() => {
  return createSolanaRpc(solanaRpcUrl)
})
