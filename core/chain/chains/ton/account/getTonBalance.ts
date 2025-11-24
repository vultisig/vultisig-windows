import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

type TonBalanceResponse = {
  address: string
  balance: string
  extra_balance: {
    [key: string]: string
  }
  wallet_state: {
    wallet_type: string
    wallet_id: string
    seqno: number
  }
  pools: Array<{
    address: string
    amount: string
  }>
}

export async function getTonBalance(address: string) {
  const url = `${rootApiUrl}/ton/getBalance?address=${address}`
  const data = await queryUrl<TonBalanceResponse>(url)

  return data
}
