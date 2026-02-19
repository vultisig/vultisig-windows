import { OtherChain } from '@core/chain/Chain'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getSolanaTxStatus: TxStatusResolver<OtherChain.Solana> = async ({
  hash,
}) => {
  const client = getSolanaClient()

  const { data, error } = await attempt(client.getSignatureStatus(hash))

  if (error || !data || !data.value) {
    return 'pending'
  }

  const { confirmationStatus, err } = data.value

  if (err) {
    return 'error'
  }

  if (
    confirmationStatus === 'confirmed' ||
    confirmationStatus === 'finalized'
  ) {
    return 'success'
  }

  return 'pending'
}
