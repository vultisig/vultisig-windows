import { attempt } from '@lib/utils/attempt'

export type ThorBondNode = {
  address: string
  bond: string
  status: string
}

type ThorBondResponse = {
  nodes: ThorBondNode[]
}

type TcyStakeResponse = {
  amount: string
}

type ThorchainPool = {
  asset: string
  status: string
  balance_asset: string
  balance_rune: string
  pool_units: string
}

export type ThorchainLpPosition = {
  asset: string
  asset_address?: string
  rune_address?: string
  units: string
  rune_deposit_value: string
  asset_deposit_value: string
}

type ThorchainPoolLpResponse = ThorchainLpPosition

const midgardBase = 'https://midgard.ninerealms.com/v2'
const thornodeBase = 'https://thornode.ninerealms.com'

export const fetchThorBondNodes = async (
  address: string
): Promise<ThorBondNode[]> => {
  if (!address) return []
  const res = await fetch(`${midgardBase}/bonds/${address}`)
  if (!res.ok) {
    const error = await attempt(() => res.text())
    throw new Error(
      `Failed to fetch THOR bonds (${res.status}): ${
        'data' in error ? error.data : res.statusText
      }`
    )
  }
  const json = (await res.json()) as ThorBondResponse
  return json.nodes ?? []
}

export const fetchThorTcyStakedAmount = async (
  address: string
): Promise<bigint> => {
  if (!address) return 0n
  const res = await fetch(`${thornodeBase}/thorchain/tcy_staker/${address}`)
  if (!res.ok) {
    return 0n
  }
  const json = (await res.json()) as TcyStakeResponse
  return BigInt(json.amount ?? '0')
}

const fetchThorPools = async (): Promise<ThorchainPool[]> => {
  const res = await fetch(`${thornodeBase}/thorchain/pools`)
  if (!res.ok) {
    throw new Error(`Failed to fetch pools: ${res.statusText}`)
  }
  const json = (await res.json()) as ThorchainPool[]
  return json.filter(pool => pool.status === 'Available')
}

export const fetchThorLpPositions = async (
  address: string
): Promise<ThorchainLpPosition[]> => {
  if (!address) return []

  const pools = await fetchThorPools()
  const positions: ThorchainLpPosition[] = []

  for (const pool of pools) {
    const res = await fetch(
      `${thornodeBase}/thorchain/pool/${pool.asset}/liquidity_provider/${address}`
    )

    if (!res.ok) {
      continue
    }

    const lp = (await res.json()) as ThorchainPoolLpResponse
    if (lp?.units && BigInt(lp.units) > 0n) {
      positions.push(lp)
    }
  }

  return positions
}
