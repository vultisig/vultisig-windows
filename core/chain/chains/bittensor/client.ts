import { rootApiUrl } from '@core/config'
import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { ApiPromise, HttpProvider } from '@polkadot/api'

// TODO: Switch to proxied URL when Johnny sets up vultiserver /tao/ route
// Production: `${rootApiUrl}/tao/`
// Testing: OnFinality public RPC (CORS-enabled)
export const bittensorRpcUrl =
  'https://bittensor-finney.api.onfinality.io/public'

export const getBittensorClient = memoizeAsync(() => {
  const provider = new HttpProvider(bittensorRpcUrl)
  return ApiPromise.create({ provider })
})
