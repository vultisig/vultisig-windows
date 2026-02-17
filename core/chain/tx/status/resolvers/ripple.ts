import { OtherChain } from '@core/chain/Chain'
import { getRippleClient } from '@core/chain/chains/ripple/client'
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
    return 'pending'
  }

  const { validated, meta } = response.result

  if (validated) {
    if (
      typeof meta === 'object' &&
      meta !== null &&
      'TransactionResult' in meta &&
      meta.TransactionResult === 'tesSUCCESS'
    ) {
      return 'success'
    }
    return 'error'
  }

  return 'pending'
}
