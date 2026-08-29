import { getPsbtTransferInfo } from '@vultisig/core-chain/chains/utxo/tx/getPsbtTransferInfo'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'

import { CustomTxData } from './customTxData'
import { ParsedTx } from './parsedTx'

export const getTxAmount = ({ coin, customTxData }: ParsedTx) =>
  matchRecordUnion<CustomTxData, bigint | string>(customTxData, {
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
    polkadot: () => BigInt(0),
    // Pre-built PTB: the amount is encoded in the bytes, not surfaced here.
    sui: () => BigInt(0),
    // A Payment is the one raw XRPL transaction whose reviewed scalar must be
    // bound to the signed bytes. Keep the drops string verbatim because the
    // signer compares it exactly; offers and trust lines have no equivalent
    // scalar representation in the keysign payload.
    ripple: ({ transaction }) =>
      transaction.TransactionType === 'Payment' &&
      typeof transaction.Amount === 'string'
        ? transaction.Amount
        : BigInt(0),
  })
