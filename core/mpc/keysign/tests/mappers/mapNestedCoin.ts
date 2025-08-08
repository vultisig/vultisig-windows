import {
  booleanOrUndefined,
  emptyToUndefined,
  numberOrUndefined,
} from '../utils'

export const mapNestedCoin = (c: any) => {
  if (!c) return undefined
  return {
    ticker: c.ticker,
    chain: c.chain,
    address: c.address,
    contractAddress: emptyToUndefined(c.contract_address ?? c.contractAddress),
    decimals: numberOrUndefined(c.decimals),
    isNativeToken: booleanOrUndefined(c.is_native_token ?? c.isNativeToken),
    priceProviderId: c.price_provider_id ?? c.priceProviderId,
    logo: c.logo,
    hexPublicKey: c.hex_public_key ?? c.hexPublicKey,
  }
}
