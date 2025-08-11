import { Coin } from '../../../types/vultisig/keysign/v1/coin_pb'

export const mapNestedCoin = (c: any): Coin => {
  return {
    chain: c.chain,
    ticker: c.ticker,
    address: c.address,
    hexPublicKey: c.hex_public_key ?? c.hexPublicKey,
    $typeName: 'vultisig.keysign.v1.Coin',
    // IMPORTANT: preserve empty string; do NOT emptyToUndefined here
    contractAddress: c.contract_address ?? c.contractAddress ?? '',
    decimals: Number(c.decimals),
    isNativeToken: Boolean(c.is_native_token ?? c.isNativeToken),
    priceProviderId: c.price_provider_id ?? c.priceProviderId,
    logo: c.logo,
  }
}
