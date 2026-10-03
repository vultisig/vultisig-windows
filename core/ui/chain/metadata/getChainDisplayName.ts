import { Chain } from '@vultisig/core-chain/Chain'

const chainDisplayNames: Record<Chain, string> = {
  [Chain.Sui]: 'Sui',
  [Chain.Solana]: 'Solana',
  [Chain.Polkadot]: 'Polkadot',
  [Chain.Bittensor]: 'Bittensor',
  // The Open Network kept its name when its native token rebranded TON -> GRAM.
  [Chain.Ton]: 'TON (GRAM)',
  [Chain.Ripple]: 'Ripple',
  [Chain.Tron]: 'Tron',
  [Chain.Cardano]: 'Cardano',
  [Chain.QBTC]: 'QBTC',
  [Chain.THORChain]: 'THORChain',
  [Chain.MayaChain]: 'MayaChain',
  [Chain.Cosmos]: 'Cosmos',
  [Chain.Osmosis]: 'Osmosis',
  [Chain.Dydx]: 'dYdX',
  [Chain.Terra]: 'Terra',
  [Chain.TerraClassic]: 'Terra Classic',
  [Chain.Noble]: 'Noble',
  [Chain.Akash]: 'Akash',
  [Chain.Bitcoin]: 'Bitcoin',
  [Chain.BitcoinCash]: 'Bitcoin Cash',
  [Chain.Litecoin]: 'Litecoin',
  [Chain.Dogecoin]: 'Dogecoin',
  [Chain.Dash]: 'Dash',
  [Chain.Zcash]: 'Zcash',
  [Chain.Avalanche]: 'Avalanche',
  [Chain.CronosChain]: 'Cronos Chain',
  [Chain.BSC]: 'BSC',
  [Chain.Ethereum]: 'Ethereum',
  [Chain.Polygon]: 'Polygon',
  [Chain.Hyperliquid]: 'Hyperliquid',
  [Chain.Sei]: 'Sei',
  [Chain.Arbitrum]: 'Arbitrum',
  [Chain.Base]: 'Base',
  [Chain.Blast]: 'Blast',
  [Chain.Optimism]: 'Optimism',
  [Chain.Zksync]: 'ZKsync',
  [Chain.Mantle]: 'Mantle',
  [Chain.Robinhood]: 'Robinhood',
}

/**
 * The name shown for a chain in the UI. Every chain needs an explicit entry,
 * so a new chain fails to build until it gets a label. The `Chain` value itself
 * is an identifier (storage keys, logo paths, keysign payloads) and never
 * changes.
 */
export const getChainDisplayName = (chain: Chain): string =>
  chainDisplayNames[chain]
