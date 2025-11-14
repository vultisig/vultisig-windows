import { rootApiUrl } from '@core/config'
import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { ApiPromise, HttpProvider } from '@polkadot/api'

export const polkadotRpcUrl = `${rootApiUrl}/dot/`

export const getPolkadotClient = memoizeAsync(() => {
  const provider = new HttpProvider(polkadotRpcUrl)
  return ApiPromise.create({ provider })
})
