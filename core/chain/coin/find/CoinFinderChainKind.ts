export const coinFinderChainKinds = ['evm', 'cosmos', 'solana'] as const
export type CoinFinderChainKind = (typeof coinFinderChainKinds)[number]
