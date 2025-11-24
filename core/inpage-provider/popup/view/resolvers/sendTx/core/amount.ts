import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'

import { CustomTxData } from './customTxData'
import { ParsedTx } from './parsedTx'

export const getTxAmount = ({ coin, customTxData }: ParsedTx) =>
  matchRecordUnion<CustomTxData, bigint>(customTxData, {
    regular: ({ transactionDetails }) =>
      BigInt(transactionDetails.amount?.amount ?? 0),
    solana: tx => {
      const { inAmount } = getRecordUnionValue(tx)
      return BigInt(inAmount ?? 0)
    },
    psbt: psbt => {
      const { sendAmount } = getPsbtTransferInfo(psbt, coin.address)
      return sendAmount
    },
  })
