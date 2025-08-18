import { Chain, CosmosChain } from '@core/chain/Chain'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { attempt } from '@lib/utils/attempt'

import { cosmosRpcUrl } from '../../../../chains/cosmos/cosmosRpcUrl'
import { TokenMetadataResolver } from '../resolver'

type DenomUnits = { denom: string; exponent: number }
type DenomMetadata = {
  base?: string
  symbol?: string
  display?: string
  denom_units?: DenomUnits[]
}
const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json() as Promise<T>
}

const decimalsFromMeta = (meta?: DenomMetadata | null): number | null => {
  if (!meta?.denom_units || !meta.display) return null
  const unit = meta.denom_units.find(
    u => u.denom === (meta.symbol || meta.display)
  )
  return unit?.exponent ?? null
}

const deriveTicker = (denom: string, meta?: DenomMetadata | null): string => {
  if (meta?.symbol) return meta.symbol
  if (meta?.display) return meta.display

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
  const byDenom = `${lcdBase}/cosmos/bank/v1beta1/denoms_metadata/${encodeURIComponent(denom)}`
  const byDenomRes = await attempt(() =>
    fetchJson<{ metadata?: DenomMetadata }>(byDenom)
  )
  if (byDenomRes.data?.metadata) return byDenomRes.data.metadata

  // Fallback: list & filter
  const listUrl = `${lcdBase}/cosmos/bank/v1beta1/denoms_metadata?pagination.limit=1000`
  const listRes = await attempt(() =>
    fetchJson<{ metadatas?: DenomMetadata[] }>(listUrl)
  )
  return listRes.data?.metadatas?.find(data => data.base === denom) ?? null
}

export const getCosmosTokenMetadata: TokenMetadataResolver<
  CosmosChain
> = async ({ chain, id }) => {
  const lcd = cosmosRpcUrl[chain as CosmosChain]
  const meta = await getDenomMetaFromLCD(lcd, id)

  let decimals = decimalsFromMeta(meta)
  if (decimals == null) {
    decimals = chain === Chain.THORChain || id.startsWith('x/') ? 8 : 6
  }

  const ticker = deriveTicker(id, meta)

  return {
    ticker,
    decimals,
  }
}
