import { solanaConfig } from '@vultisig/core-chain/chains/solana/solanaConfig'

const microLamportsPerLamport = 1_000_000n

const ceilDiv = (dividend: bigint, divisor: bigint) =>
  (dividend + divisor - 1n) / divisor

type GetSolanaStakingFeeInput = {
  /** Priority-fee price, in micro-lamports per compute unit. */
  priorityFeePrice: bigint
  /** Compute-unit limit the staking transaction requests. */
  priorityFeeLimit: number
}

/**
 * Lamports a Solana staking transaction costs its sender: the per-signature
 * base fee plus the prioritization fee `buildUnsignedStakingTx` always attaches
 * (price × compute-unit limit, rounded up like the runtime does). Budgeting for
 * the base fee alone leaves a max-sized stake ~0.0001 SOL short and the network
 * rejects it at simulation.
 */
export const getSolanaStakingFee = ({
  priorityFeePrice,
  priorityFeeLimit,
}: GetSolanaStakingFeeInput) =>
  BigInt(solanaConfig.baseFee) +
  ceilDiv(priorityFeePrice * BigInt(priorityFeeLimit), microLamportsPerLamport)

/**
 * The staking fee at the configured priority-fee floor. The live per-slot price
 * is only known once the keysign payload's chain-specific data is fetched, so
 * the delegate form budgets with the floor and the pre-sign funding guard
 * re-checks against the price actually encoded into the transaction.
 */
export const solanaStakingFloorFee = getSolanaStakingFee({
  priorityFeePrice: BigInt(solanaConfig.priorityFeePrice),
  priorityFeeLimit: solanaConfig.priorityFeeLimit,
})
