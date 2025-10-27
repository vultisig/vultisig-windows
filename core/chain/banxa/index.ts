import { addQueryParams } from '@lib/utils/query/addQueryParams'
import { getRecordKeys } from '@lib/utils/record/getRecordKeys'

import { Chain } from '../Chain'
import { AccountCoin } from '../coin/AccountCoin'

const banxaChainCode = {
  [Chain.Bitcoin]: 'BTC',
  [Chain.BitcoinCash]: 'BCH',
  [Chain.Litecoin]: 'LTC',
  [Chain.Dogecoin]: 'DOGE',
  [Chain.Dash]: 'DASH',
  [Chain.Zcash]: 'ZEC',
  [Chain.THORChain]: 'THORCHAIN',
  [Chain.Solana]: 'SOL',
  [Chain.Polkadot]: 'DOT',
  [Chain.Ton]: 'TON',
  [Chain.Ripple]: 'XRP',
  [Chain.Tron]: 'TRON',
  [Chain.Cardano]: 'ADA',
  [Chain.Sui]: 'SUI',
  [Chain.Ethereum]: 'ETH',
  [Chain.Avalanche]: 'AVAX-C',
  [Chain.Base]: 'BASE',
  [Chain.Arbitrum]: 'ARB',
  [Chain.Polygon]: 'MATIC',
  [Chain.Optimism]: 'OPTIMISM',
  [Chain.BSC]: 'BSC',
  [Chain.Zksync]: 'ZKSYNC',
  [Chain.Blast]: 'BLAST',
  [Chain.Mantle]: 'MNT',
  [Chain.CronosChain]: 'CRO',
} as const satisfies Partial<Record<Chain, string>>

export const banxaSupportedChains = getRecordKeys(banxaChainCode)
type BanxaSupportedChain = (typeof banxaSupportedChains)[number]

export const getBanxaBuyUrl = ({
  address,
  ticker,
  chain,
}: Pick<AccountCoin<BanxaSupportedChain>, 'chain' | 'address' | 'ticker'>) =>
  addQueryParams('https://vultisig.banxa.com/', {
    walletAddress: address,
    blockchain: banxaChainCode[chain],
    coinType: ticker,
  })
