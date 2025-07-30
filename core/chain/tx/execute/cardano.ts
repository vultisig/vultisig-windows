import { Serialization } from '@cardano-sdk/core'
import { OtherChain } from '@core/chain/Chain'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCardanoTx: ExecuteTxResolver<OtherChain.Cardano> = async ({
  tx,
}) => {
  const rawTx = Buffer.from(tx.encoded).toString('hex')
  const txHash = Serialization.Transaction.fromCbor(
    Serialization.TxCBOR(rawTx)
  ).getId()

  return { txHash }
}
