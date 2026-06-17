import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'

export const vultStakingName = 'VULT Staking'

/** Vault address used for every read/sign in this protocol lives on Ethereum. */
export const vultStakingChain = Chain.Ethereum
export const vultStakingEvmChain = EvmChain.Ethereum

/** sVULT ERC20-wrapper (Ethereum mainnet) — staking mints sVULT 1:1 with VULT. */
export const sVultAddress = '0x11113d7311FB8584a6e82BB126aA11D92e5fB39B'

/**
 * First block holding sVULT bytecode. `UnstakeRequested` logs cannot exist
 * before this, so it is the lower bound for `eth_getLogs` scans.
 */
export const sVultDeploymentBlock = 25323569n

/** The underlying VULT coin, reused from knownTokens (carries logo + price id). */
export const vultCoin = vult

/**
 * sVULT receipt token. Redeems 1:1 for VULT, so it shares VULT's price provider
 * for fiat conversion. Defined locally since it is not a standalone tradable token.
 */
export const sVultCoin: Coin = {
  chain: Chain.Ethereum,
  id: sVultAddress,
  ticker: 'sVULT',
  logo: vult.logo,
  decimals: 18,
  priceProviderId: vult.priceProviderId,
}
