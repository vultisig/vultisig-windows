import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

interface TonAccountInfoResponse {
  ok: boolean
  result: {
    address: {
      account_address: string
    }
    balance: string
    last_transaction_id: {
      lt: string
      hash: string
    }
    block_id: {
      workchain: number
      shard: string
      seqno: number
      root_hash: string
      file_hash: string
    }
    sync_utime: number
    account_state: {
      wallet_id: string
      seqno: number
    }
    revision: number
    '@extra': string
  }
}

export async function getTonAccountInfo(address: string) {
  const url = `${rootApiUrl}/ton/v2/getExtendedAddressInformation?address=${address}`
  const { result } = await queryUrl<TonAccountInfoResponse>(url)

  return result
}
