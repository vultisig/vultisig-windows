import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { CustomTxData } from './customTxData'

export const getTxReceiver = (customTxData: CustomTxData) =>
  matchRecordUnion<CustomTxData, string | undefined>(customTxData, {
    regular: ({ transactionDetails }) => transactionDetails.to ?? undefined,
    solana: tx => getRecordUnionValue(tx).authority,
    psbt: () => undefined,
  })
