import { ChainInfo } from '@keplr-wallet/types'

/**
 * Minimal `experimentalSuggestChain` schema check. Keplr's reference
 * implementation validates a long list of fields with bech32 parsing and
 * regex constraints — we just enforce the ones cosmos-kit dApps depend on
 * (chainId, chainName, rpc/rest, bech32 prefix, at least one currency).
 * Anything malformed gets a Keplr-shaped throw so the dApp can surface a
 * useful error instead of silently failing later. Runs both inpage, for that
 * readable error, and in the background, which can't trust the inpage check.
 */
export const validateSuggestedChainInfo = (info: unknown): void => {
  if (!info || typeof info !== 'object') {
    throw new Error('chainInfo must be an object')
  }
  const ci = info as Partial<ChainInfo>
  const requireString = (key: keyof ChainInfo): void => {
    const value = ci[key]
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`chainInfo.${String(key)} must be a non-empty string`)
    }
  }
  requireString('chainId')
  requireString('chainName')
  requireString('rpc')
  requireString('rest')
  if (
    !ci.bech32Config ||
    typeof ci.bech32Config.bech32PrefixAccAddr !== 'string'
  ) {
    throw new Error('chainInfo.bech32Config.bech32PrefixAccAddr is required')
  }
  if (!Array.isArray(ci.currencies) || ci.currencies.length === 0) {
    throw new Error('chainInfo.currencies must be a non-empty array')
  }
  if (!Array.isArray(ci.feeCurrencies) || ci.feeCurrencies.length === 0) {
    throw new Error('chainInfo.feeCurrencies must be a non-empty array')
  }
  if (!ci.bip44 || typeof ci.bip44.coinType !== 'number') {
    throw new Error('chainInfo.bip44.coinType must be a number')
  }
}
