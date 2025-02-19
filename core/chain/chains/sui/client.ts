import { memoize } from '@lib/utils/memoize'
import { SuiClient } from '@mysten/sui/client'

export const getSuiClient = memoize(
  () => new SuiClient({ url: 'https://sui-rpc.publicnode.com' })
)
