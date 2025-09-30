import { match } from '@lib/utils/match'

import { UtxoChain } from '../../../Chain'

/**
 * Calculate transaction size based on inputs/outputs
 */
export const estimateTransactionSize = ({
  inputCount,
  outputCount,
  chain,
}: {
  inputCount: number
  outputCount: number
  chain: UtxoChain
}): number => {
  // Base transaction overhead
  const baseOverhead = 10 // version + locktime + input count + output count

  // Input size (P2WPKH)
  const inputSize = 41 // outpoint(36) + scriptSig len(1, empty) + sequence(4)
  const witnessSize = 107 // signature + pubkey for P2WPKH

  // Output size
  const outputSize = 31 // value(8) + scriptPubKey len(1) + p2wpkh script(22)

  // Calculate base size (non-witness)
  const baseSize =
    baseOverhead + inputSize * inputCount + outputSize * outputCount

  // Calculate witness size
  const totalWitnessSize = 2 /* marker+flag */ + witnessSize * inputCount

  // Calculate vbytes
  const vbytes = Math.ceil((baseSize * 4 + totalWitnessSize) / 4)

  // Apply chain-specific multiplier
  const chainMultiplier = getChainSizeMultiplier(chain)

  return Math.ceil(vbytes * chainMultiplier)
}

/**
 * Get dust threshold for different chains
 */
export const getDustThreshold = (chain: UtxoChain): bigint => {
  return match(chain, {
    [UtxoChain.Bitcoin]: () => 546n,
    [UtxoChain.Litecoin]: () => 1000n,
    [UtxoChain.BitcoinCash]: () => 1000n,
    [UtxoChain.Dogecoin]: () => 1000000n,
    [UtxoChain.Dash]: () => 1000n,
    [UtxoChain.Zcash]: () => 1000n,
  })
}

/**
 * Chain-specific size multipliers
 */
const getChainSizeMultiplier = (chain: UtxoChain): number => {
  return match(chain, {
    [UtxoChain.Bitcoin]: () => 1.0,
    [UtxoChain.Litecoin]: () => 1.0,
    [UtxoChain.BitcoinCash]: () => 0.8,
    [UtxoChain.Dogecoin]: () => 1.1,
    [UtxoChain.Dash]: () => 1.0,
    [UtxoChain.Zcash]: () => 1.2,
  })
}
