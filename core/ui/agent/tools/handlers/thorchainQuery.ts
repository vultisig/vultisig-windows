import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import {
  midgardBaseUrl,
  thornodeBaseUrl,
} from '@core/ui/defi/chain/queries/constants'
import {
  fetchNetwork,
  fetchNetworkInfo,
} from '@core/ui/defi/chain/queries/services/thorchainBondService'
import { fetchStakePositions } from '@core/ui/defi/chain/queries/services/thorchainStake'
import { attempt } from '@lib/utils/attempt'
import { queryUrl } from '@lib/utils/query/queryUrl'

import type { ToolHandler, ToolHandlerResult } from '../types'

const runeDecimals = 8

const formatRune = (base: string | number | undefined): string => {
  if (base === undefined || base === null) return '0'
  return fromChainAmount(BigInt(base), runeDecimals).toString()
}

const nsToISO = (ns: string | number | undefined): string => {
  if (!ns) return ''
  const ms = Number(ns) / 1_000_000
  return new Date(ms).toISOString()
}

const resolveAddress = (
  coins: Array<{ chain: string; address: string }>
): string | null => {
  const tc = coins.find(c => c.chain.toLowerCase() === 'thorchain')
  return tc?.address ?? null
}

type MidgardPool = {
  asset?: string
  status?: string
  volume24h?: string
  assetDepth?: string
  runeDepth?: string
  assetPrice?: string
  assetPriceUSD?: string
  annualPercentageRate?: string
  poolAPY?: string
  units?: string
  synthUnits?: string
}

type MidgardMember = {
  pools?: Array<{
    pool?: string
    assetAdded?: string
    assetWithdrawn?: string
    runeAdded?: string
    runeWithdrawn?: string
    dateFirstAdded?: string
    dateLastAdded?: string
    liquidityUnits?: string
    assetAddress?: string
    runeAddress?: string
  }>
}

const queryLpPositions = async (address: string) => {
  const data = await queryUrl<MidgardMember>(
    `${midgardBaseUrl}/member/${address}`
  )
  const pools = data?.pools ?? []
  return pools.map(p => ({
    pool: p.pool ?? '',
    asset_added: formatRune(p.assetAdded),
    asset_withdrawn: formatRune(p.assetWithdrawn),
    rune_added: formatRune(p.runeAdded),
    rune_withdrawn: formatRune(p.runeWithdrawn),
    first_added: nsToISO(p.dateFirstAdded),
    last_added: nsToISO(p.dateLastAdded),
    liquidity_units: p.liquidityUnits ?? '0',
  }))
}

const querySaverPositions = async (address: string) => {
  const data = await queryUrl<MidgardMember>(
    `${midgardBaseUrl}/member/${address}?showSavers=true`
  )
  const pools = data?.pools ?? []
  return pools.map(p => ({
    pool: p.pool ?? '',
    asset_added: formatRune(p.assetAdded),
    asset_withdrawn: formatRune(p.assetWithdrawn),
    first_added: nsToISO(p.dateFirstAdded),
    last_added: nsToISO(p.dateLastAdded),
    liquidity_units: p.liquidityUnits ?? '0',
  }))
}

type BondedNodesResponse = {
  nodes?: Array<{
    status?: string
    address: string
    bond?: string
  }>
}

const queryBondPositions = async (address: string) => {
  const data = await queryUrl<BondedNodesResponse>(
    `${midgardBaseUrl}/bonds/${address}`
  )
  const nodes = data?.nodes ?? []
  return nodes.map(n => ({
    node_address: n.address,
    bond_rune: formatRune(n.bond),
    status: n.status ?? 'unknown',
  }))
}

type NodeDetailsResponse = {
  node_address?: string
  status?: string
  bond?: string
  current_award?: string
  slash_points?: number
  forced_to_leave?: boolean
  requested_to_leave?: boolean
  bond_providers?: {
    node_operator_fee?: string
    providers?: Array<{
      bond_address?: string
      bond?: string
    }>
  }
  ip_address?: string
  version?: string
  jail?: {
    release_height?: number
    reason?: string
  }
}

const queryNodeDetails = async (address: string) => {
  const data = await queryUrl<NodeDetailsResponse>(
    `${thornodeBaseUrl}/node/${address}`
  )
  const providers = data?.bond_providers?.providers ?? []
  return {
    node_address: data?.node_address ?? address,
    status: data?.status ?? 'unknown',
    total_bond: formatRune(data?.bond),
    current_award: formatRune(data?.current_award),
    slash_points: data?.slash_points ?? 0,
    forced_to_leave: data?.forced_to_leave ?? false,
    requested_to_leave: data?.requested_to_leave ?? false,
    operator_fee_bps: data?.bond_providers?.node_operator_fee ?? '0',
    version: data?.version ?? '',
    providers: providers.map(p => ({
      address: p.bond_address ?? '',
      bond_rune: formatRune(p.bond),
    })),
  }
}

const queryPoolInfo = async (asset?: string) => {
  if (asset) {
    const data = await queryUrl<MidgardPool>(`${midgardBaseUrl}/pool/${asset}`)
    return [
      {
        asset: data?.asset ?? asset,
        status: data?.status ?? '',
        volume_24h: formatRune(data?.volume24h),
        asset_depth: formatRune(data?.assetDepth),
        rune_depth: formatRune(data?.runeDepth),
        asset_price_usd: data?.assetPriceUSD ?? '',
        apy: data?.poolAPY ?? data?.annualPercentageRate ?? '',
      },
    ]
  }

  const pools = await queryUrl<MidgardPool[]>(`${midgardBaseUrl}/pools`)
  const sorted = (pools ?? [])
    .sort((a, b) => Number(b.volume24h ?? '0') - Number(a.volume24h ?? '0'))
    .slice(0, 20)

  return sorted.map(p => ({
    asset: p.asset ?? '',
    status: p.status ?? '',
    volume_24h: formatRune(p.volume24h),
    asset_depth: formatRune(p.assetDepth),
    rune_depth: formatRune(p.runeDepth),
    asset_price_usd: p.assetPriceUSD ?? '',
    apy: p.poolAPY ?? p.annualPercentageRate ?? '',
  }))
}

type RuneProviderResponse = {
  rune_address?: string
  deposit_amount?: string
  withdraw_amount?: string
  last_deposit_height?: number
  last_withdraw_height?: number
  value?: string
  pnl?: string
}

const queryRunePool = async (address: string) => {
  const data = await queryUrl<RuneProviderResponse>(
    `${thornodeBaseUrl}/rune_provider/${address}`
  )
  return {
    address: data?.rune_address ?? address,
    deposited: formatRune(data?.deposit_amount),
    withdrawn: formatRune(data?.withdraw_amount),
    current_value: formatRune(data?.value),
    pnl: formatRune(data?.pnl),
  }
}

const queryNetworkInfo = async () => {
  const [midgard, thornode] = await Promise.all([
    fetchNetworkInfo().catch(() => undefined),
    fetchNetwork().catch(() => undefined),
  ])
  return {
    bonding_apy: midgard?.bondingAPY ?? 0,
    next_churn_height: midgard?.nextChurnHeight ?? 0,
    vaults_migrating: thornode?.vaults_migrating ?? false,
  }
}

const queryStakePositions = async (address: string) => {
  const result = await fetchStakePositions({ address, prices: {} })
  return result.positions.map(p => ({
    ticker: p.ticker,
    amount: fromChainAmount(p.amount, runeDecimals).toString(),
    type: p.type ?? 'stake',
    apr: p.apr ?? 0,
    estimated_reward: p.estimatedReward ?? 0,
    reward_ticker: p.rewardTicker ?? '',
    can_unstake: p.canUnstake ?? false,
  }))
}

type TradeAccount = {
  asset?: string
  units?: string
  owner?: string
  last_add_height?: number
  last_withdraw_height?: number
}

const queryTradeAccounts = async (address: string) => {
  const data = await queryUrl<TradeAccount[]>(
    `${thornodeBaseUrl}/trade/account/${address}`
  )
  return (data ?? []).map(a => ({
    asset: a.asset ?? '',
    units: formatRune(a.units),
    owner: a.owner ?? '',
  }))
}

type QueryHandler = (
  input: Record<string, unknown>,
  address: string,
  asset: string | undefined
) => Promise<ToolHandlerResult>

const thorchainQueryHandlers: Record<string, QueryHandler> = {
  lp_positions: async (_input, address) => {
    const positions = await queryLpPositions(address)
    return {
      data: {
        query_type: 'lp_positions',
        address,
        positions,
        count: positions.length,
      },
    }
  },

  saver_positions: async (_input, address) => {
    const positions = await querySaverPositions(address)
    return {
      data: {
        query_type: 'saver_positions',
        address,
        positions,
        count: positions.length,
      },
    }
  },

  bond_positions: async (_input, address) => {
    const positions = await queryBondPositions(address)
    return {
      data: {
        query_type: 'bond_positions',
        address,
        positions,
        count: positions.length,
      },
    }
  },

  node_details: async (input, address) => {
    const nodeAddr = input.node_address ? String(input.node_address) : address
    const details = await queryNodeDetails(nodeAddr)
    return {
      data: {
        query_type: 'node_details',
        ...details,
      },
    }
  },

  pool_info: async (_input, _address, asset) => {
    const pools = await queryPoolInfo(asset)
    return {
      data: {
        query_type: 'pool_info',
        pools,
        count: pools.length,
      },
    }
  },

  rune_pool: async (_input, address) => {
    const position = await queryRunePool(address)
    return {
      data: {
        query_type: 'rune_pool',
        ...position,
      },
    }
  },

  network_info: async () => {
    const info = await queryNetworkInfo()
    return {
      data: {
        query_type: 'network_info',
        ...info,
      },
    }
  },

  stake_positions: async (_input, address) => {
    const positions = await queryStakePositions(address)
    return {
      data: {
        query_type: 'stake_positions',
        address,
        positions,
        count: positions.length,
      },
    }
  },

  trade_accounts: async (_input, address) => {
    const accounts = await queryTradeAccounts(address)
    return {
      data: {
        query_type: 'trade_accounts',
        address,
        accounts,
        count: accounts.length,
      },
    }
  },
}

export const handleThorchainQuery: ToolHandler = async (input, context) => {
  const queryType = String(input.query_type ?? '')
  const asset = input.asset ? String(input.asset) : undefined

  const address = resolveAddress(context.coins)
  if (!address && queryType !== 'pool_info' && queryType !== 'network_info') {
    return {
      data: {
        error: 'No THORChain address found in vault. Add THORChain first.',
      },
    }
  }

  const handler = thorchainQueryHandlers[queryType]
  if (!handler) {
    return {
      data: {
        error: `Unknown query_type: ${queryType}. Valid types: lp_positions, saver_positions, bond_positions, node_details, pool_info, rune_pool, network_info, stake_positions, trade_accounts`,
      },
    }
  }

  const result = await attempt(() => handler(input, address ?? '', asset))
  if ('error' in result) {
    const message =
      result.error instanceof Error
        ? result.error.message
        : String(result.error)
    return {
      data: {
        query_type: queryType,
        error: message,
      },
    }
  }

  return result.data
}
