import { UtxoChain } from '@core/chain/Chain'

import {
  estimateTransactionSize,
  getDustThreshold,
} from './estimateTransactionSize'

export type UtxoInput = {
  hash: string
  amount: bigint
  index: number
}

/**
 * Performs coin selection to determine which UTXOs to use for a transaction
 * This mimics wallet core real UTXO behavior for better fee calculation
 */
export const estimateSizeForAmount = ({
  utxoInfo,
  amount,
  byteFee,
  chain,
  sendMaxAmount = false,
}: {
  utxoInfo: UtxoInput[]
  amount: bigint
  byteFee: number
  chain: UtxoChain
  sendMaxAmount?: boolean
}): number => {
  if (sendMaxAmount) {
    return estimateTransactionSize({
      inputCount: utxoInfo.length,
      outputCount: 1, // no change for max amount
      chain,
    })
  }
  return largestFirstSelection(utxoInfo, amount, byteFee, chain)
}

/**
 * Largest First coin selection - most common strategy
 * Selects largest UTXOs first to minimize transaction size
 */
const largestFirstSelection = (
  utxoInfo: UtxoInput[],
  amount: bigint,
  byteFee: number,
  chain: UtxoChain
): number => {
  // Sort UTXOs by amount descending (largest first)
  const sortedUtxos = [...utxoInfo].sort((a, b) =>
    a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0
  )

  const selectedUtxos: UtxoInput[] = []
  let totalInput = 0n

  // Keep adding UTXOs until we have enough to cover amount + fees
  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo)
    totalInput += utxo.amount

    // Calculate current transaction size and fee
    const currentSize = estimateTransactionSize({
      inputCount: selectedUtxos.length,
      outputCount: 2, // recipient + change
      chain,
    })
    const currentFee = BigInt(Math.ceil(currentSize * byteFee))

    // Check if we have enough for target amount + fee
    if (totalInput >= amount + currentFee) {
      const changeAmount = totalInput - amount - currentFee

      // If change is too small (dust), add it to fee
      const dustThreshold = getDustThreshold(chain)
      if (changeAmount < dustThreshold) {
        return estimateTransactionSize({
          inputCount: selectedUtxos.length,
          outputCount: 1, // no change output
          chain,
        })
      }
      return currentSize
    }
  }

  throw new Error('Insufficient funds for transaction')
}
