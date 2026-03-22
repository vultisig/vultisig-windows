import { CosmosChain } from '@core/chain/Chain'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'

/**
 * Sums `fee.amount` entries whose denom matches the chain's native fee denom.
 * Matching is case-insensitive because sign data / RPC payloads differ by platform.
 */
export const sumFeeAmountForCosmosChainFeeDenom = (
  amounts: readonly { denom: string; amount: string }[] | undefined,
  chain: CosmosChain
): bigint | null => {
  if (!amounts?.length) {
    return null
  }

  const target = cosmosFeeCoinDenom[chain].toLowerCase()
  const matching = amounts.filter(({ denom }) => denom.toLowerCase() === target)

  if (matching.length === 0) {
    return null
  }

  return matching.reduce((sum, { amount }) => sum + BigInt(amount), 0n)
}
