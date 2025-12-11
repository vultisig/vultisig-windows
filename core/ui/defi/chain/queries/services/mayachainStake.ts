import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import {
  daysInYear,
  thorchainBlockTimeSeconds,
} from '@core/ui/defi/chain/constants/time'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { mayaCoin } from '../tokens'
import { ThorchainStakePosition } from '../types'
import { parseBigint, parseNumber } from '../utils/parsers'

const mayaMidgardBaseUrl = 'https://midgard.mayachain.info/v2'
const mayanodeBaseUrl = 'https://mayanode.mayachain.info/mayachain'

type CacaoPoolMember = {
  deposit_amount?: string
  withdraw_amount?: string
  units?: string
  last_withdraw_height?: string
  last_deposit_height?: string
}

type MayaNetwork = {
  liquidityAPY?: string
}

type MayaHealth = {
  lastThorNode?: {
    height?: number
  }
}

type MayaMimir = {
  CACAOPOOLDEPOSITMATURITYBLOCKS?: number
}

const getCacaoPoolMember = (address: string) =>
  queryUrl<CacaoPoolMember>(`${mayanodeBaseUrl}/cacao_provider/${address}`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

const getMayaNetwork = () =>
  queryUrl<MayaNetwork>(`${mayaMidgardBaseUrl}/network`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

const getMayaHealth = () =>
  queryUrl<MayaHealth>(`${mayaMidgardBaseUrl}/health`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

const getMayaMimir = () =>
  queryUrl<MayaMimir>(`${mayanodeBaseUrl}/mimir`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

type FetchMayaStakePositionsInput = {
  address: string
  prices: Record<string, number>
}

export const fetchMayaStakePositions = async ({
  address,
  prices,
}: FetchMayaStakePositionsInput) => {
  try {
    const [member, network, health, mimir] = await Promise.all([
      getCacaoPoolMember(address),
      getMayaNetwork(),
      getMayaHealth(),
      getMayaMimir(),
    ])

    const deposited = parseBigint(member?.deposit_amount)
    const withdrawn = parseBigint(member?.withdraw_amount)
    const net = deposited - withdrawn
    const amount = net > 0n ? net : 0n

    const price = prices[coinKeyToString(mayaCoin)] ?? 0
    const fiatValue = getCoinValue({
      amount,
      decimals: mayaCoin.decimals,
      price,
    })

    const liquidityAPYDecimal = parseNumber(network?.liquidityAPY)
    const apyPercent = liquidityAPYDecimal * 100
    const apr =
      liquidityAPYDecimal > 0
        ? (Math.pow(1 + liquidityAPYDecimal, 1 / daysInYear) - 1) *
          daysInYear *
          100
        : 0

    const maturityBlocks = mimir?.CACAOPOOLDEPOSITMATURITYBLOCKS ?? 0
    const currentHeight = health?.lastThorNode?.height ?? 0
    const lastDepositHeight = parseNumber(member?.last_deposit_height)
    const blocksSinceDeposit = currentHeight - lastDepositHeight
    const blocksRemaining = maturityBlocks - blocksSinceDeposit

    const canUnstake = amount === 0n || blocksRemaining <= 0
    const unstakeAvailableDate = canUnstake
      ? undefined
      : new Date(
          Date.now() + blocksRemaining * thorchainBlockTimeSeconds * 1000
        )

    const position: ThorchainStakePosition = {
      id: 'maya-stake-cacao',
      ticker: mayaCoin.ticker,
      amount,
      fiatValue,
      apr,
      type: 'stake',
      canUnstake,
      unstakeAvailableDate,
      estimatedReward: undefined,
      rewards: undefined,
    }

    // Include APY as APR surrogate if APR is zero but APY present
    if (position.apr === 0 && apyPercent > 0) {
      position.apr = apyPercent
    }

    return { positions: [position] }
  } catch {
    return { positions: [] }
  }
}
