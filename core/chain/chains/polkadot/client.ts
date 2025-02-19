import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { ApiPromise, HttpProvider } from '@polkadot/api'

export const getPolkadotClient = memoizeAsync(() => {
  const provider = new HttpProvider('https://polkadot-rpc.publicnode.com')
  return ApiPromise.create({ provider })
})
