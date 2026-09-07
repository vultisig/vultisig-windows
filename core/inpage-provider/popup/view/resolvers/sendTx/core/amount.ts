import { decodeSubstrateTransfer } from '@core/ui/polkadot/dapp/decodeTransferCall'
import { getPsbtTransferInfo } from '@vultisig/core-chain/chains/utxo/tx/getPsbtTransferInfo'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'

import { CustomTxData } from './customTxData'
import { ParsedTx } from './parsedTx'

/**
 * Returns native XRPL Payment drops verbatim; other routes return a bigint.
 * An empty string means the route has no reviewable scalar, which renders as
 * no amount row rather than as a zero the signed bytes do not agree with.
 */
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
    // The amount lives in the SCALE call the dApp asked us to sign, and the
    // signer encodes that call verbatim. Decoding it is what binds the
    // reviewed number to the signed bytes; a call that carries no transfer
    // scalar yields no amount at all, and one that claims to but does not
    // decode throws, failing the review closed.
    polkadot: ({ chain, signerPayload }) =>
      decodeSubstrateTransfer({ method: signerPayload.method, chain })
        ?.amount ?? '',
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
