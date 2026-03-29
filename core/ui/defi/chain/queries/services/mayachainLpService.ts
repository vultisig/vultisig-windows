import { mayanodeBaseUrl } from '../constants'
import { ThorchainLpPositionData } from './thorchainLpService'

type MayachainLiquidityProviderResponse = {
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

type FetchMayachainLpPositionInput = {
  poolAsset: string
  address: string
}

/** Fetches a single MayaChain LP position for a given pool and address. */
const fetchMayachainLpPosition = async ({
  poolAsset,
  address,
}: FetchMayachainLpPositionInput): Promise<ThorchainLpPositionData | null> => {
  const url = `${mayanodeBaseUrl}/pool/${poolAsset}/liquidity_provider/${address}`

  try {
    const response = await fetch(url, {
      headers: { 'X-Client-ID': 'vultisig' },
    })

    if (!response.ok) return null

    const data: MayachainLiquidityProviderResponse = await response.json()

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

type FetchMayachainLpPositionsInput = {
  poolAssets: string[]
  address: string
}

/** Fetches MayaChain LP positions for multiple pools in parallel. */
export const fetchMayachainLpPositions = async ({
  poolAssets,
  address,
}: FetchMayachainLpPositionsInput): Promise<ThorchainLpPositionData[]> => {
  const results = await Promise.all(
    poolAssets.map(poolAsset =>
      fetchMayachainLpPosition({ poolAsset, address })
    )
  )

  return results.filter(
    (r): r is ThorchainLpPositionData => r !== null && r.units !== '0'
  )
}
