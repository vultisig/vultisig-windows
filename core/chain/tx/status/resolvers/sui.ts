import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getSuiTxStatus: TxStatusResolver<OtherChain.Sui> = async ({
  hash,
}) => {
  const client = getSuiClient()

  const { data, error } = await attempt(
    client.getTransactionBlock({
      digest: hash,
      options: { showEffects: true },
    })
  )

  if (error || !data) {
    return 'pending'
  }

  const status = data.effects?.status?.status

  if (status === 'success') {
    return 'success'
  }

  if (status === 'failure') {
    return 'error'
  }

  return 'pending'
}
