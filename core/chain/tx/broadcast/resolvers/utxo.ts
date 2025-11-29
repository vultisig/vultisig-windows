import { OtherChain, UtxoBasedChain, UtxoChain } from '@core/chain/Chain'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getChainKind } from '../../../ChainKind'
import { getBlockchairBaseUrl } from '../../../chains/utxo/client/getBlockchairBaseUrl'
import { SigningOutput } from '../../../tw/signingOutput'
import { BroadcastTxResolver } from '../resolver'

type UtxoBasedDecodedTx =
  | SigningOutput<UtxoChain>
  | SigningOutput<OtherChain.Cardano>

type BlockchairBroadcastResponse =
  | {
      data: {
        transaction_hash: string
      } | null
    }
  | {
      data: null
      context: {
        error: string
      }
    }

export const broadcastUtxoTx: BroadcastTxResolver<UtxoBasedChain> = async ({
  chain,
  tx,
}) => {
  const url = `${getBlockchairBaseUrl(chain)}/push/transaction`
  const encodedBytes = selectEncodedBytes(chain, tx as UtxoBasedDecodedTx)

  const response = await queryUrl<BlockchairBroadcastResponse>(url, {
    body: {
      data: Buffer.from(encodedBytes).toString('hex'),
    },
  })

  if (response.data) {
    return response.data.transaction_hash
  }

  const error =
    'context' in response ? response.context.error : extractErrorMsg(response)

  if (
    isInError(
      error,
      'BadInputsUTxO',
      'timed out',
      'txn-mempool-conflict',
      'already known'
    )
  ) {
    return null
  }

  throw new Error(`Failed to broadcast transaction: ${extractErrorMsg(error)}`)
}

const hasSigningResultV2 = (
  tx: UtxoBasedDecodedTx
): tx is SigningOutput<UtxoChain> & {
  signingResultV2: { encoded?: Uint8Array | null }
} =>
  tx != null &&
  typeof tx === 'object' &&
  'signingResultV2' in tx &&
  !!(tx as any).signingResultV2

export const selectEncodedBytes = (
  chain: UtxoBasedChain,
  tx: UtxoBasedDecodedTx
): Uint8Array => {
  if (
    getChainKind(chain) === 'utxo' &&
    hasSigningResultV2(tx) &&
    tx.signingResultV2.encoded
  ) {
    return shouldBePresent(tx.signingResultV2.encoded)
  }
  return shouldBePresent(tx.encoded)
}
