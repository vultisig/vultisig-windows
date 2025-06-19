import { isOneOf } from '@lib/utils/array/isOneOf'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { TransactionType } from '../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { CosmosChainSpecific } from './chainSpecific'

export const shouldPropagateMemo = (chainSpecific: CosmosChainSpecific) =>
  matchRecordUnion(chainSpecific, {
    ibcEnabled: ({ transactionType }) =>
      !isOneOf(transactionType, [
        TransactionType.IBC_TRANSFER,
        TransactionType.VOTE,
      ]),
    vaultBased: ({ isDeposit }) => !isDeposit,
  })
