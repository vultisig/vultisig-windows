import { Chain } from '../../../../Chain'
import { KnownCoinMetadata } from '../../../../coin/Coin'
import { knownCosmosTokens } from '../../../../coin/knownTokens/cosmos'

export const tcyCompounderContract =
  'thor1z7ejlk5wk2pxh9nfwjzkkdnrq4p2f5rjcpudltv0gh282dwfz6nq9g2cr0' as const

export const tcyDenom = 'tcy' as const
export const stcyDenom = 'x/staking-tcy' as const

const thorTokens = knownCosmosTokens[Chain.THORChain]
const tcyMeta = thorTokens?.[tcyDenom]

export const tcyTicker = tcyMeta?.ticker ?? 'TCY'
export const tcyDecimals = tcyMeta?.decimals ?? 8

export const stcyTicker = 'sTCY' as const
export const stcyDecimals = tcyDecimals

export const stcyMetadata: KnownCoinMetadata = {
  ticker: stcyTicker,
  logo: tcyMeta?.logo ?? 'tcy.png',
  decimals: stcyDecimals,
}

export const isStcyDenom = (d: string): d is typeof stcyDenom => d === stcyDenom
export const isTcyDenom = (d: string): d is typeof tcyDenom => d === tcyDenom
