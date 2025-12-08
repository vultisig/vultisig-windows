import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import {
  blocksPerDay,
  daysInYear,
  thorchainBlockTimeSeconds,
} from '@core/ui/defi/chain/constants/time'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { midgardBaseUrl, rujiStakeApiUrl, thornodeBaseUrl } from '../constants'
import { runeCoin, thorchainTokens } from '../tokens'
import { ThorchainStakePosition } from '../types'
import { toDecimalFactor } from '../utils/decimals'
import { convertAPYtoAPR } from '../utils/apy'
import { encodeBase64, parseBigint, parseNumber } from '../utils/parsers'

const runeDecimalFactor = toDecimalFactor(runeCoin.decimals)
const tcyDecimalFactor = toDecimalFactor(thorchainTokens.tcy.decimals)
const stcyDecimalFactor = toDecimalFactor(thorchainTokens.stcy.decimals)
const rujiDecimalFactor = toDecimalFactor(thorchainTokens.ruji.decimals)

const getTcyStaker = (address: string) =>
  queryUrl<{ amount?: string }>(`${thornodeBaseUrl}/tcy_staker/${address}`)

const getTcyModuleBalance = () =>
  queryUrl<{ coins?: Array<{ denom?: string; amount?: string }> }>(
    `${thornodeBaseUrl}/balance/module/tcy_stake`
  )

const getTcyUserDistributions = (address: string) =>
  queryUrl<{ distributions?: Array<{ date?: string; amount?: string }> }>(
    `${midgardBaseUrl}/tcy/distribution/${address}`
  )

const getTcyStakers = () =>
  queryUrl<{ tcy_stakers?: Array<{ amount?: string }> }>(
    `${thornodeBaseUrl}/tcy_stakers`
  )

const getThorchainConstants = () =>
  queryUrl<{ int_64_values: { MinRuneForTCYStakeDistribution: number } }>(
    `${thornodeBaseUrl}/constants`
  )

const getLastBlock = async () => {
  const data = await queryUrl<Array<{ thorchain?: number }>>(
    `${thornodeBaseUrl}/lastblock`
  )
  return data?.[0]?.thorchain ?? 0
}

const getRujiStake = (address: string) => {
  const variables = { id: encodeBase64(`Account:${address}`) }
  const query = `
    query ($id: ID!) {
      node(id: $id) {
        ... on Account {
          stakingV2 {
            bonded { amount asset { metadata { symbol } } }
            pendingRevenue { amount asset { metadata { symbol } } }
            pool { summary { apr { value } } }
          }
        }
      }
    }`

  return queryUrl<{
    data?: {
      node?: {
        stakingV2?: Array<{
          bonded?: {
            amount?: string
            asset?: { metadata?: { symbol?: string } | null } | null
          } | null
          pendingRevenue?: {
            amount?: string
            asset?: { metadata?: { symbol?: string } | null } | null
          } | null
          pool?: { summary?: { apr?: { value?: string | null } | null } | null } | null
        } | null> | null
      } | null
    } | null
  }>(rujiStakeApiUrl, {
    body: { query, variables },
  })
}

const fetchTcyStakePosition = async (
  address: string,
  prices: Record<string, number>
): Promise<ThorchainStakePosition | null> => {
  const staker = await getTcyStaker(address).catch(() => undefined)
  const amount = parseBigint(staker?.amount)

  const price = prices[coinKeyToString(thorchainTokens.tcy)] ?? 0
  const fiatValue = getCoinValue({
    amount,
    decimals: thorchainTokens.tcy.decimals,
    price,
  })

  let estimatedReward = 0
  let apyPercent = 0
  let nextPayout: Date | undefined

  try {
    const [dist, moduleBalance, constants, totalStakers] = await Promise.all([
      getTcyUserDistributions(address),
      getTcyModuleBalance(),
      getThorchainConstants(),
      getTcyStakers(),
    ])

    const distributions = dist?.distributions ?? []
    if (distributions.length > 0) {
      const totalRune = distributions.reduce(
        (sum, d) => sum + parseNumber(d.amount) / runeDecimalFactor,
        0
      )
      const avgDailyRune = totalRune / distributions.length
      const annualRune = avgDailyRune * daysInYear
      const runePrice = prices[coinKeyToString(runeCoin)] ?? 0
      const annualUSD = annualRune * runePrice
      const stakedValueUSD =
        fromChainAmount(amount, thorchainTokens.tcy.decimals) * price
      apyPercent = stakedValueUSD > 0 ? (annualUSD / stakedValueUSD) * 100 : 0
    }

    const runeBalance = moduleBalance?.coins?.find(
      coin => coin.denom === 'rune'
    )
    const currentAccruedRune = parseNumber(runeBalance?.amount) / runeDecimalFactor
    const constantsMinRune =
      (constants?.int_64_values.MinRuneForTCYStakeDistribution ?? 0) /
      runeDecimalFactor

    const lastBlock = await getLastBlock()
    const nextBlock = Math.ceil(lastBlock / blocksPerDay) * blocksPerDay
    const blocksRemaining = nextBlock - lastBlock
    const lastDistributionBlock =
      Math.floor(lastBlock / blocksPerDay) * blocksPerDay
    const blocksSinceLastDistribution = lastBlock - lastDistributionBlock
    const runePerBlock =
      blocksSinceLastDistribution > 0
        ? currentAccruedRune / blocksSinceLastDistribution
        : currentAccruedRune
    const totalEstimatedRune =
      currentAccruedRune + runePerBlock * blocksRemaining

    const distributionMultiplier = constantsMinRune
      ? Math.floor(totalEstimatedRune / constantsMinRune)
      : 0
    const actualDistributionAmount = distributionMultiplier * constantsMinRune

    const totalStaked =
      (totalStakers?.tcy_stakers ?? []).reduce(
        (sum, staker) => sum + parseNumber(staker.amount) / tcyDecimalFactor,
        0
      ) || 0
    const userShare =
      totalStaked > 0
        ? fromChainAmount(amount, thorchainTokens.tcy.decimals) / totalStaked
        : 0
    estimatedReward = actualDistributionAmount * userShare

    const currentBlock = await getLastBlock()
    const blocksRemainingForNext = blocksPerDay - (currentBlock % blocksPerDay)
    const secondsRemaining = blocksRemainingForNext * thorchainBlockTimeSeconds
    nextPayout = new Date(Date.now() + secondsRemaining * 1000)
  } catch {
    // Silent fallback to base values
  }

  return {
    id: 'thor-stake-tcy',
    ticker: thorchainTokens.tcy.ticker,
    amount,
    fiatValue,
    estimatedReward,
    apr: convertAPYtoAPR(apyPercent),
    nextPayout,
    rewardTicker: runeCoin.ticker,
  }
}

const fetchStcyStakePosition = async (
  address: string,
  prices: Record<string, number>
): Promise<ThorchainStakePosition | null> => {
  try {
    const denom = encodeURIComponent(tcyAutoCompounderConfig.shareDenom)
    const balance = await queryUrl<{ balance?: { amount?: string } }>(
      `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`
    )
    const amount = parseBigint(balance?.balance?.amount)
    const price = prices[coinKeyToString(thorchainTokens.stcy)] ?? 0
    const fiatValue = getCoinValue({
      amount,
      decimals: thorchainTokens.stcy.decimals,
      price,
    })

    return {
      id: 'thor-stake-stcy',
      ticker: thorchainTokens.stcy.ticker,
      amount,
      fiatValue,
      estimatedReward: 0,
    }
  } catch {
    return null
  }
}

const fetchRujiStakePosition = async (
  address: string,
  prices: Record<string, number>
): Promise<ThorchainStakePosition | null> => {
  try {
    const response = await getRujiStake(address)
    const stake = response?.data?.node?.stakingV2?.[0]
    const bondedAmount = parseBigint(stake?.bonded?.amount)
    const rewardsAmount =
      parseNumber(stake?.pendingRevenue?.amount) / rujiDecimalFactor
    const aprValue = parseNumber(stake?.pool?.summary?.apr?.value)
    const price = prices[coinKeyToString(thorchainTokens.ruji)] ?? 0

    const fiatValue = getCoinValue({
      amount: bondedAmount,
      decimals: thorchainTokens.ruji.decimals,
      price,
    })

    return {
      id: 'thor-stake-ruji',
      ticker: thorchainTokens.ruji.ticker,
      amount: bondedAmount,
      fiatValue,
      apr: aprValue * 100,
      rewards: rewardsAmount,
      rewardTicker: 'USDC',
    }
  } catch {
    return null
  }
}

export const fetchStakePositions = async (
  address: string,
  prices: Record<string, number>
) => {
  const [tcy, stcy, ruji] = await Promise.all([
    fetchTcyStakePosition(address, prices),
    fetchStcyStakePosition(address, prices),
    fetchRujiStakePosition(address, prices),
  ])

  const positions = [tcy, stcy, ruji].filter(
    Boolean
  ) as ThorchainStakePosition[]
  return { positions }
}
