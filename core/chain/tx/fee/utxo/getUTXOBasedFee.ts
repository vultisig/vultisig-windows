import { UtxoChain } from '@core/chain/Chain'

import { estimateSizeForAmount, UtxoInput } from './estimateSizeForAmount'

type GetUTXOBasedFeeInput = {
  utxoInfo: UtxoInput[]
  amount: bigint
  byteFee: number
  chain: UtxoChain
  sendMaxAmount?: boolean
}

/**
 * Calculates transaction fee using coin selection algorithms
 * This considers which specific UTXOs will be selected based on the amount
 */
export const getUTXOBasedFee = ({
  utxoInfo,
  amount,
  byteFee,
  chain,
  sendMaxAmount = false,
}: GetUTXOBasedFeeInput): bigint => {
  const estimatedSize = estimateSizeForAmount({
    utxoInfo,
    amount,
    byteFee,
    chain,
    sendMaxAmount,
  })

  return BigInt(Math.ceil(estimatedSize * byteFee))
}
