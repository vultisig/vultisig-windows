import { CosmosChain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { TokenMetadataResolver } from '@core/chain/coin/token/metadata/resolver'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { attempt } from '@lib/utils/attempt'
import { asyncFallbackChain } from '@lib/utils/promise/asyncFallbackChain'
import { queryUrl } from '@lib/utils/query/queryUrl'

type DenomUnits = { denom: string; exponent: number }
type DenomMetadata = {
  base?: string
  symbol?: string
  display?: string
  denom_units?: DenomUnits[]
}

const decimalsFromMeta = (meta: DenomMetadata): number | null => {
  if (!meta.denom_units || !meta.display) return null
  const unit = meta.denom_units.find(
    u => u.denom === (meta.symbol || meta.display)
  )
  return unit?.exponent ?? null
}

const deriveTicker = (denom: string, meta: DenomMetadata): string => {
  if (meta.symbol) return meta.symbol
  if (meta.display) return meta.display

  if (denom.startsWith('x/staking-')) {
    const base = denom.replace('x/staking-', '')
    return `S${base}`
  }
  if (denom.startsWith('x/')) {
    return getLastItem(denom.split('/'))
  }
  if (denom.startsWith('factory/')) {
    const sub = getLastItem(denom.split('/'))
    return sub.replace(/^u/, '')
  }
  return denom
}

const getDenomMetaFromLCD = async (
  lcdBase: string,
  denom: string
): Promise<DenomMetadata | null> => {
  return asyncFallbackChain(
    async () => {
      const byDenom = `${lcdBase}/cosmos/bank/v1beta1/denoms_metadata/${encodeURIComponent(denom)}`
      const byDenomRes = await attempt(() =>
        queryUrl<{ metadata?: DenomMetadata }>(byDenom)
      )
      if (byDenomRes.data?.metadata) return byDenomRes.data.metadata
      throw new Error('Could not fetch metadata byDenom')
    },
    async () => {
      const listUrl = `${lcdBase}/cosmos/bank/v1beta1/denoms_metadata?pagination.limit=1000`
      const listRes = await attempt(() =>
        queryUrl<{ metadatas?: DenomMetadata[] }>(listUrl)
      )
      return listRes.data?.metadatas?.find(data => data.base === denom) ?? null
    }
  )
}

export const getCosmosTokenMetadata: TokenMetadataResolver<
  CosmosChain
> = async ({ chain, id }) => {
  const knownMeta = knownCosmosTokens[chain]?.[id]
  if (knownMeta) {
    return {
      ticker: knownMeta.ticker,
      decimals: knownMeta.decimals,
    }
  }

  const lcd = cosmosRpcUrl[chain as CosmosChain]
  const meta = await getDenomMetaFromLCD(lcd, id)
  if (!meta) throw new Error(`No denom meta information available for ${id}`)
  const decimals = decimalsFromMeta(meta)
  if (!decimals) throw new Error(`Could not fetch decimal for ${id}`)
  const ticker = deriveTicker(id, meta)

  return {
    ticker,
    decimals,
  }
}
