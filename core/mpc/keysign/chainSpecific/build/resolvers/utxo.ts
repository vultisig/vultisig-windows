import { create } from '@bufbuild/protobuf'
import { UTXOSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildUtxoSpecific: BuildChainSpecificResolver<'utxoSpecific'> = ({
  feeQuote,
  txData,
}) =>
  create(UTXOSpecificSchema, {
    ...txData,
    byteFee: feeQuote.byteFee.toString(),
  })
