import {
  GeneralSwapProvider,
  generalSwapProviderName,
  generalSwapProviders,
} from '@vultisig/core-chain/swap/general/GeneralSwapProvider'
import { nativeSwapChains } from '@vultisig/core-chain/swap/native/NativeSwapChain'

import { getChainLogoSrc } from './getChainLogoSrc'

// Brand assets shared with the iOS app (`Assets.xcassets/Crypto`). LI.FI only
// ships a raster there, so the file extension is part of the mapping. CowSwap
// has no iOS asset and keeps its own.
const generalSwapProviderLogo: Record<GeneralSwapProvider, string> = {
  '1inch': '1inch.svg',
  'li.fi': 'lifi.png',
  kyber: 'kyber.svg',
  swapkit: 'swapkit.svg',
  cowswap: 'cowswap.svg',
  jupiter: 'jupiter.svg',
}

const logoSrcByProviderName = new Map<string, string>([
  ...nativeSwapChains.map((chain): [string, string] => [
    chain,
    getChainLogoSrc(chain),
  ]),
  ...generalSwapProviders.map((provider): [string, string] => [
    generalSwapProviderName[provider],
    `/core/swap-providers/${generalSwapProviderLogo[provider]}`,
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
