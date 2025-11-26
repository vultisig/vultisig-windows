import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

type TonWalletResponse = {
  balance: string
  last_transaction_lt?: string
  last_transaction_hash?: string
  status?: string
  pools?: Array<{
    address: string
    amount: string
  }>
}

export async function getTonBalance(address: string) {
  const url = `${rootApiUrl}/ton/v3/wallet?address=${address}`
  const data = await queryUrl<TonWalletResponse>(url)

  return {
    ...data,
    pools: data.pools ?? [],
  }
}
