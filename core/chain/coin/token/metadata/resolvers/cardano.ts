import { cardanoApiUrl } from '@core/chain/chains/cardano/client/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TokenMetadataResolver } from '../resolver'

// Koios asset_info response
type CardanoAssetInfoResponse = Array<{
  policy_id: string
  asset_name: string // hex encoded
  asset_name_ascii: string
  fingerprint: string
  total_supply: string
  decimals: number
  token_registry_metadata?: {
    name?: string
    ticker?: string
    logo?: string // base64 or URL
    decimals?: number
  }
}>

export const getCardanoTokenMetadata: TokenMetadataResolver = async ({
  id,
}) => {
  // id format: policy_id + asset_name_hex (concatenated)
  // policy_id is 56 characters
  const policyId = id.slice(0, 56)
  const assetNameHex = id.slice(56)

  const url = `${cardanoApiUrl}/asset_info`
  const [data] = await queryUrl<CardanoAssetInfoResponse>(url, {
    body: {
      _asset_list: [[policyId, assetNameHex]],
    },
  })

  const ticker =
    data.token_registry_metadata?.ticker ?? data.asset_name_ascii ?? 'UNKNOWN'
  const decimals = data.token_registry_metadata?.decimals ?? data.decimals ?? 0
  const logo = data.token_registry_metadata?.logo

  return { ticker, decimals, logo, priceProviderId: undefined }
}
