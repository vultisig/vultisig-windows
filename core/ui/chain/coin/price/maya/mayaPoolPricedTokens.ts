/**
 * MAYAChain tokens whose USD price is derived from their liquidity pool
 * rather than CoinGecko.
 *
 * Each key is the coin ID (matching the knownTokens key for MayaChain),
 * and the value contains the pool asset identifier and native decimals.
 */
export const mayaPoolPricedTokens = {
  maya: { poolAsset: 'MAYA.MAYA', decimals: 4 },
} as const

export type MayaPoolPricedTokenId = keyof typeof mayaPoolPricedTokens
