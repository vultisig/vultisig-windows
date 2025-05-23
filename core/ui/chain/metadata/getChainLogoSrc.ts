import { Chain, EthereumL2Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { getCoinLogoSrc } from '../coin/icon/utils/getCoinLogoSrc'

export const getChainLogoSrc = (chain: Chain) => {
  if (isOneOf(chain, Object.values(EthereumL2Chain))) {
    return `/core/chains/${chain.toLowerCase()}.svg`
  }

  const { logo } = chainFeeCoin[chain]

  return getCoinLogoSrc(logo)
}
