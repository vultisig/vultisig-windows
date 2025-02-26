import { getRippleClient } from '../client'

export const getRippleAccountInfo = async (address: string) => {
  const client = await getRippleClient()

  const { result } = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'current',
    queue: true,
  })

  return result.account_data
}
