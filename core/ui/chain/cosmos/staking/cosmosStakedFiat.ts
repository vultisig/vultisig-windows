type CosmosStakedFiatInput = {
  /** Active delegations; only `balance.amount` (base units) is read. */
  delegations: { balance: { amount: string } }[] | undefined
  /** Spot price of the staking token in the display fiat, or undefined while loading. */
  price: number | undefined
  /** Staking-token base-unit exponent (Terra family = 6, QBTC = 8). */
  decimals: number
}

/**
 * Aggregate fiat value of a Cosmos staking position: sum of staked base units
 * across all delegations, scaled by `decimals` and multiplied by the spot
 * price. Returns 0 while either input is missing (loading, or no price feed —
 * e.g. qbtc-testnet) so callers render `$0.00` cleanly. Single source of truth
 * for the DeFi portfolio rollup and the per-chain hero banners.
 */
export const cosmosStakedFiat = ({
  delegations,
  price,
  decimals,
}: CosmosStakedFiatInput): number => {
  if (!delegations || price === undefined) return 0
  const totalUnits = delegations.reduce(
    (acc, d) => acc + Number(d.balance.amount),
    0
  )
  return (totalUnits / 10 ** decimals) * price
}
