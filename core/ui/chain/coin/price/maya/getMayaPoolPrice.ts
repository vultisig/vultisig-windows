import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

type MayaPoolResponse = {
  balance_cacao: string
  balance_asset: string
}

const cacaoDecimals = 10

type GetMayaPoolPriceInput = {
  asset: string
  assetDecimals: number
  cacaoPriceUsd: number
}

/**
 * Derives a MAYAChain token price from its liquidity pool.
 *
 * Price is calculated as:
 *   (balance_cacao / 10^cacaoDecimals) / (balance_asset / 10^assetDecimals) * cacaoPriceUsd
 */
export const getMayaPoolPrice = async ({
  asset,
  assetDecimals,
  cacaoPriceUsd,
}: GetMayaPoolPriceInput): Promise<number | undefined> => {
  const url = `${cosmosRpcUrl.MayaChain}/mayachain/pool/${asset}`

  const result = await attempt(() => queryUrl<MayaPoolResponse>(url))
  if ('error' in result) return undefined

  const pool = result.data
  const cacaoAmount = Number(pool.balance_cacao) / 10 ** cacaoDecimals
  const assetAmount = Number(pool.balance_asset) / 10 ** assetDecimals

  if (assetAmount === 0) return undefined

  return (cacaoAmount / assetAmount) * cacaoPriceUsd
}
