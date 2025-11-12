import { Chain, EthereumL2Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { getCoinLogoSrc } from '../coin/icon/utils/getCoinLogoSrc'

const chainsWithChainLogo = [
  ...Object.values(EthereumL2Chain),
  Chain.MayaChain,
] as const

export const getChainLogoSrc = (chain: Chain) => {
  if (isOneOf(chain, chainsWithChainLogo)) {
    return `/core/chains/${chain.toLowerCase()}.svg`
  }

  const { logo } = chainFeeCoin[chain]

  return getCoinLogoSrc(logo)
}
