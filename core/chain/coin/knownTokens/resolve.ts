import { Chain, CosmosChain } from '@core/chain/Chain'
import { attempt } from '@lib/utils/attempt'

import { cosmosRpcUrl } from '../../chains/cosmos/cosmosRpcUrl'
import { KnownCoin, KnownCoinMetadata } from '../Coin'

type DenomUnits = { denom: string; exponent: number }
type DenomMetadata = {
  base?: string
  symbol?: string
  display?: string
  denom_units?: DenomUnits[]
}
type GetKnownOrFetchTokenInput = {
  chain: Chain
  denom: string
  localKnown: Record<string, KnownCoinMetadata> | undefined
}
const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json() as Promise<T>
}

const decimalsFromMeta = (meta?: DenomMetadata | null): number | null => {
  if (!meta?.denom_units || !meta.display) return null
  const unit = meta.denom_units.find(u => u.denom === meta.display)
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
    return denom.split('/').pop()!
  }
  if (denom.startsWith('factory/')) {
    const sub = denom.split('/').pop()!
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

  return null
}

export const getKnownOrFetchToken = async ({
  chain,
  denom,
  localKnown,
}: GetKnownOrFetchTokenInput): Promise<KnownCoin | null> => {
  const local = localKnown?.[denom]
  if (local) {
    return { ...local, chain, id: denom }
  }
  // only try to fetch for Cosmos chains
  const lcd = cosmosRpcUrl[chain as CosmosChain]
  if (!lcd) return null

  const meta = await getDenomMetaFromLCD(lcd, denom)
  // derive decimals
  let decimals = decimalsFromMeta(meta)
  if (decimals == null) {
    // sensible defaults
    decimals = chain === Chain.THORChain || denom.startsWith('x/') ? 8 : 6
  }

  const ticker = deriveTicker(denom, meta)

  const resolved: KnownCoinMetadata = {
    ticker,
    decimals,
    logo: ticker.toLowerCase(),
  }
  return { ...resolved, chain, id: denom }
}
