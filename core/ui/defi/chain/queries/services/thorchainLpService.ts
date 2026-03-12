import { thornodeBaseUrl } from '../constants'

type ThorchainLiquidityProviderResponse = {
  asset: string
  rune_address: string
  asset_address: string
  last_add_height: number
  units: string
  pending_rune: string
  pending_asset: string
  rune_deposit_value: string
  asset_deposit_value: string
  rune_redeem_value: string
  asset_redeem_value: string
  luvi_deposit_value: string
  luvi_redeem_value: string
  luvi_growth_pct: string
}

export type ThorchainLpPositionData = {
  poolAsset: string
  runeRedeemValue: string
  assetRedeemValue: string
  units: string
  runeDepositValue: string
  assetDepositValue: string
}

const fetchThorchainLpPosition = async (
  poolAsset: string,
  address: string
): Promise<ThorchainLpPositionData | null> => {
  const url = `${thornodeBaseUrl}/pool/${poolAsset}/liquidity_provider/${address}`

  try {
    const response = await fetch(url, {
      headers: { 'X-Client-ID': 'vultisig' },
    })

    if (!response.ok) return null

    const data: ThorchainLiquidityProviderResponse = await response.json()

    return {
      poolAsset: data.asset,
      runeRedeemValue: data.rune_redeem_value,
      assetRedeemValue: data.asset_redeem_value,
      units: data.units,
      runeDepositValue: data.rune_deposit_value,
      assetDepositValue: data.asset_deposit_value,
    }
  } catch {
    return null
  }
}

export const fetchThorchainLpPositions = async (
  poolAssets: string[],
  address: string
): Promise<ThorchainLpPositionData[]> => {
  const results = await Promise.all(
    poolAssets.map(asset => fetchThorchainLpPosition(asset, address))
  )

  return results.filter(
    (r): r is ThorchainLpPositionData => r !== null && r.units !== '0'
  )
}
