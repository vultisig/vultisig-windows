import { Chain, EthereumL2Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { getCoinLogoSrc } from '../coin/icon/utils/getCoinLogoSrc'

const chainsWithChainLogo = [
  ...Object.values(EthereumL2Chain),
  Chain.MayaChain,
  // The Open Network keeps its TON chain logo even though its native token
  // rebranded TON -> GRAM, so the chain icon is decoupled from the fee-coin logo.
  Chain.Ton,
  // Terra and Terra Classic keep their own chain logos so the corrected LUNA/LUNC
  // fee-coin logos don't override the chain icons.
  Chain.Terra,
  Chain.TerraClassic,
] as const

export const getChainLogoSrc = (chain: Chain) => {
  if (isOneOf(chain, chainsWithChainLogo)) {
    return `/core/chains/${chain.toLowerCase()}.svg`
  }

  const { logo } = chainFeeCoin[chain]

  return getCoinLogoSrc(logo)
}
