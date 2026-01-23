import { OtherChain } from '@core/chain/Chain'
import { cardanoApiUrl } from '@core/chain/chains/cardano/client/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from '../resolver'

type CardanoAddressInfoResponse = Array<{
  balance: string
}>

type CardanoAddressAssetsResponse = Array<{
  policy_id: string
  asset_name: string // hex
  quantity: string
}>

export const getCardanoCoinBalance: CoinBalanceResolver<
  OtherChain.Cardano
> = async input => {
  if (!input.id) {
    const url = `${cardanoApiUrl}/address_info`

    const [{ balance } = { balance: '0' }] =
      await queryUrl<CardanoAddressInfoResponse>(url, {
        body: {
          _addresses: [input.address],
        },
      })

    return BigInt(balance)
  }

  const url = `${cardanoApiUrl}/address_assets`
  const assets = await queryUrl<CardanoAddressAssetsResponse>(url, {
    body: {
      _addresses: [input.address],
    },
  })

  // id format: policy_id + asset_name_hex
  const policyId = input.id.slice(0, 56)
  const assetNameHex = input.id.slice(56)

  const asset = assets.find(
    a => a.policy_id === policyId && a.asset_name === assetNameHex
  )

  return BigInt(asset?.quantity ?? '0')
}
