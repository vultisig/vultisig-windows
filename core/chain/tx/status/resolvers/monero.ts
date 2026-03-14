import { Chain, OtherChain } from '@core/chain/Chain'
import { getMoneroDaemonUrl } from '@core/chain/chains/monero/daemonRpc'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

type MoneroTxDetail = {
  in_pool: boolean
  block_height: number
  double_spend_seen: boolean
  tx_hash: string
  as_json?: string
}

type GetTransactionsResponse = {
  txs: MoneroTxDetail[]
  status: string
}

const getTransaction = async (
  hash: string
): Promise<GetTransactionsResponse> => {
  const url = `${getMoneroDaemonUrl()}/get_transactions`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txs_hashes: [hash], decode_as_json: true }),
  })
  return resp.json()
}

const parseFeeFromJson = (asJson: string): bigint | null => {
  const { data, error } = attempt(() => JSON.parse(asJson))
  if (error || !data) return null
  const fee = data.rct_signatures?.txnFee
  if (typeof fee === 'number') return BigInt(fee)
  if (typeof fee === 'string') return BigInt(fee)
  return null
}

export const getMoneroTxStatus: TxStatusResolver<OtherChain.Monero> = async ({
  hash,
}) => {
  const { data: response, error } = await attempt(getTransaction(hash))

  if (error || !response || response.status !== 'OK' || !response.txs?.length) {
    return { status: 'pending' }
  }

  const tx = response.txs[0]

  if (tx.double_spend_seen) {
    return { status: 'error' }
  }

  if (tx.in_pool) {
    return { status: 'pending' }
  }

  const feeCoin = chainFeeCoin[Chain.Monero]
  const fee = tx.as_json ? parseFeeFromJson(tx.as_json) : null
  const receipt =
    fee !== null
      ? {
          feeAmount: fee,
          feeDecimals: feeCoin.decimals,
          feeTicker: feeCoin.ticker,
        }
      : undefined

  return { status: 'success', receipt }
}
