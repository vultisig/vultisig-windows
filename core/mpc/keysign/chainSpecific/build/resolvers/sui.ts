import { create } from '@bufbuild/protobuf'
import { SuiSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { BuildChainSpecificResolver } from '../resolver'

export const buildSuiSpecific: BuildChainSpecificResolver<'suicheSpecific'> = ({
  feeQuote,
  txData,
}) =>
  create(SuiSpecificSchema, {
    ...txData,
    referenceGasPrice: feeQuote.gas.toString(),
  })
