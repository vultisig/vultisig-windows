import {
  GeneralSwapProvider,
  generalSwapProviderName,
  generalSwapProviders,
} from '@vultisig/core-chain/swap/general/GeneralSwapProvider'
import { nativeSwapChains } from '@vultisig/core-chain/swap/native/NativeSwapChain'

import { getChainLogoSrc } from './getChainLogoSrc'

const generalSwapProviderLogo: Record<GeneralSwapProvider, string> = {
  '1inch': '1inch',
  'li.fi': 'lifi',
  kyber: 'kyber',
  swapkit: 'swapkit',
  cowswap: 'cowswap',
  jupiter: 'jupiter',
}

const logoSrcByProviderName = new Map<string, string>([
  ...nativeSwapChains.map((chain): [string, string] => [
    chain,
    getChainLogoSrc(chain),
  ]),
  ...generalSwapProviders.map((provider): [string, string] => [
    generalSwapProviderName[provider],
    `/core/swap-providers/${generalSwapProviderLogo[provider]}.svg`,
  ]),
])

/**
 * Resolves the logo for a swap provider display name as produced by
 * `getSwapQuoteProviderName` / `getKeysignSwapProviderName`. Lookup is by name
 * rather than by provider key because transaction records persist only the
 * name, and the trailing route hint some providers carry (`LI.FI (Stargate)`)
 * is stripped before matching. Returns `null` for an unknown provider.
 */
export const getSwapProviderLogoSrc = (providerName: string) => {
  const [name] = providerName.split(' (')

  return logoSrcByProviderName.get(name) ?? null
}
