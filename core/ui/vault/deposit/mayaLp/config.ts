import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

/**
 * Chains whose MayaChain pool the vault can fund from the asset side: the
 * native coin goes straight to Maya's inbound vault with the memo. ERC-20
 * pools need a router deposit, so they take CACAO-only adds.
 */
export const mayaLpChains = [
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.Arbitrum,
  Chain.Dash,
  Chain.Zcash,
] as const

type MayaLpChain = (typeof mayaLpChains)[number]

const mayaLpChainCode: Record<MayaLpChain, string> = {
  [Chain.Bitcoin]: 'BTC',
  [Chain.Ethereum]: 'ETH',
  [Chain.Arbitrum]: 'ARB',
  [Chain.Dash]: 'DASH',
  [Chain.Zcash]: 'ZEC',
}

/** MayaChain's code for the chain, as used in pool names and inbound addresses. */
export const getMayaLpChainCode = (chain: MayaLpChain) => mayaLpChainCode[chain]

/** The MayaChain pool of the chain's native coin, e.g. `ARB.ETH`. */
export const getMayaLpPool = (chain: MayaLpChain) =>
  `${mayaLpChainCode[chain]}.${chainFeeCoin[chain].ticker}`

/** The asset chain of a pool the vault can fund from both sides, if it is one. */
export const getMayaLpAssetChain = (pool: string): MayaLpChain | undefined =>
  mayaLpChains.find(chain => getMayaLpPool(chain) === pool.toUpperCase())
