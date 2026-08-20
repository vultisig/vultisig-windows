import { Chain } from '@vultisig/core-chain/Chain'

/**
 * Maps internal Chain identifiers to the uppercase chain codes used in
 * THORChain / MayaChain thorname alias records (e.g. `"ETH"`, `"BTC"`).
 *
 * Only chains that THORChain or MayaChain can register aliases for are
 * included — the mapping is intentionally partial.
 */
export const chainToThornameAlias: Partial<Record<Chain, string>> = {
  [Chain.Avalanche]: 'AVAX',
  [Chain.Arbitrum]: 'ARB',
  [Chain.Base]: 'BASE',
  [Chain.Bitcoin]: 'BTC',
  [Chain.BitcoinCash]: 'BCH',
  [Chain.BSC]: 'BSC',
  [Chain.Cosmos]: 'GAIA',
  [Chain.Dash]: 'DASH',
  [Chain.Dogecoin]: 'DOGE',
  [Chain.Ethereum]: 'ETH',
  [Chain.Kujira]: 'KUJI',
  [Chain.Litecoin]: 'LTC',
  [Chain.MayaChain]: 'MAYA',
  [Chain.Ripple]: 'XRP',
  [Chain.THORChain]: 'THOR',
  [Chain.Tron]: 'TRON',
  [Chain.Zcash]: 'ZEC',
}
