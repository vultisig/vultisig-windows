import { Chain, OtherChain } from '@core/chain/Chain'
import { getRippleClient } from '@core/chain/chains/ripple/client'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getRippleTxStatus: TxStatusResolver<OtherChain.Ripple> = async ({
  hash,
}) => {
  const client = await getRippleClient()

  const { data: response, error } = await attempt(
    client.request({
      command: 'tx',
      transaction: hash,
    })
  )

  if (error || !response) {
    return { status: 'pending' }
  }

  const { validated, meta, tx_json } = response.result as {
    validated?: boolean
    meta?: { TransactionResult?: string }
    tx_json?: { Fee?: string }
  }

  if (validated) {
    const success =
      typeof meta === 'object' &&
      meta !== null &&
      'TransactionResult' in meta &&
      meta.TransactionResult === 'tesSUCCESS'

    const status = success ? 'success' : 'error'
    const feeStr = tx_json?.Fee
    const feeCoin = chainFeeCoin[Chain.Ripple]
    const receipt =
      feeStr != null && feeStr !== ''
        ? {
            feeAmount: BigInt(feeStr),
            feeDecimals: feeCoin.decimals,
            feeTicker: feeCoin.ticker,
          }
        : undefined

    return { status, receipt }
  }

  return { status: 'pending' }
}
