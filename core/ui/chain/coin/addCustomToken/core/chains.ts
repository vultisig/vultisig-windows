import { Chain } from '@core/chain/Chain'
import { ChainsOfKind, getChainKind } from '@core/chain/ChainKind'
import { isOneOf } from '@lib/utils/array/isOneOf'

const customTokenEnabledChainKinds = ['evm', 'solana'] as const
export type CustomTokenEnabledChainKind =
  (typeof customTokenEnabledChainKinds)[number]

export type CustomTokenEnabledChain = ChainsOfKind<CustomTokenEnabledChainKind>

export function isCustomTokenEnabledChain(
  chain: Chain
): chain is CustomTokenEnabledChain {
  const chainKind = getChainKind(chain)
  return isOneOf(chainKind, customTokenEnabledChainKinds)
}
