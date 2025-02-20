import { rootApiUrl } from '@core/config'
import { memoize } from '@lib/utils/memoize'
import { createSolanaRpc } from '@solana/web3.js'

export const getSolanaClient = memoize(() => {
  return createSolanaRpc(`${rootApiUrl}/solana/`)
})
