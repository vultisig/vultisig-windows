import { Chain } from '@vultisig/core-chain/Chain'

/**
 * Resolves the flat single-tone mark used for the small chain badge that sits
 * on a coin icon. Every chain has one, so unlike `getChainLogoSrc` — which
 * stays in use wherever the chain itself is shown in full colour — there is no
 * fee-coin fallback to fall back to.
 */
export const getChainMonoLogoSrc = (chain: Chain) =>
  `/core/chains/mono/${chain.toLowerCase()}.svg`
