import { Chain } from '@vultisig/core-chain/Chain'
import { bittensorConfig } from '@vultisig/core-chain/chains/bittensor/config'

type NormalizeKeysignFeeInput = {
  chain: Chain
  feeAmount: bigint
}

type FeeNormalizer = (feeAmount: bigint) => bigint

const keepFeeAmount: FeeNormalizer = feeAmount => feeAmount

const feeNormalizers: Partial<Record<Chain, FeeNormalizer>> = {
  [Chain.Bittensor]: feeAmount =>
    feeAmount === 0n ? bittensorConfig.fee : feeAmount,
}

/**
 * Replaces an unavailable chain fee with the chain's safe configured fallback.
 * Live nonzero estimates are preserved unchanged.
 */
export const normalizeKeysignFee = ({
  chain,
  feeAmount,
}: NormalizeKeysignFeeInput) =>
  (feeNormalizers[chain] ?? keepFeeAmount)(feeAmount)
