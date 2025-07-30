import { Serialization } from '@cardano-sdk/core'
import { OtherChain } from '@core/chain/Chain'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getCardanoTxHash: GetTxHashResolver<OtherChain.Cardano> = ({
  encoded,
}) =>
  Serialization.Transaction.fromCbor(
    Serialization.TxCBOR(Buffer.from(encoded).toString('hex'))
  ).getId()
