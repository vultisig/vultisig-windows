import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { Client } from 'xrpl'

export const getRippleClient = memoizeAsync(async () => {
  const client = new Client('wss://xrplcluster.com')
  await client.connect()

  return client
})
