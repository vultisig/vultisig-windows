import { memoize } from '@lib/utils/memoize'
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'

export const getSuiClient = memoize(
  () =>
    new SuiJsonRpcClient({
      url: 'https://sui-rpc.publicnode.com',
      network: 'mainnet',
    })
)
