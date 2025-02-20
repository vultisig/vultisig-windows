import { UtxoChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getBlockchairBaseUrl } from './getBlockchairBaseUrl'

type BlockchairAddressResponse = {
  data: {
    [address: string]: {
      address: {
        balance: number
      }
      utxo: {
        block_id: number
        transaction_hash: string
        index: number
        value: number
        value_usd: number
        recipient: string
        script_hex: string
        is_from_coinbase: boolean
        is_spendable: boolean
      }[]
    }
  }
}

export const getUtxoAddressInfo = ({
  address,
  chain,
}: ChainAccount<UtxoChain>) => {
  const url = `${getBlockchairBaseUrl(chain)}/dashboards/address/${address}?state=latest`

  return queryUrl<BlockchairAddressResponse>(url)
}
