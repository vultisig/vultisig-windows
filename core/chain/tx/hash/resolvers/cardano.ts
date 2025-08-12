import { Serialization } from '@cardano-sdk/core'
import { OtherChain } from '@core/chain/Chain'

import { TxHashResolver } from '../resolver'

export const getCardanoTxHash: TxHashResolver<OtherChain.Cardano> = ({
  encoded,
}) =>
  Serialization.Transaction.fromCbor(
    Serialization.TxCBOR(Buffer.from(encoded).toString('hex'))
  ).getId()
