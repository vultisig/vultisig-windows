import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import {
  blocksPerDay,
  daysInYear,
  thorchainBlockTimeSeconds,
} from '@core/ui/defi/chain/constants/time'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { midgardBaseUrl, thornodeBaseUrl } from '../../constants'
import { runeCoin, thorchainTokens } from '../../tokens'
import { ThorchainStakePosition } from '../../types'
import { convertAPYtoAPR } from '../../utils/apy'
import { toDecimalFactor } from '../../utils/decimals'
import { parseBigint, parseNumber } from '../../utils/parsers'
import { getLastBlock, getThorchainConstants } from './shared'

const runeDecimalFactor = toDecimalFactor(runeCoin.decimals)
const tcyDecimalFactor = toDecimalFactor(thorchainTokens.tcy.decimals)

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

type FetchTcyStakePositionInput = {
  address: string
  prices: Record<string, number>
}

export const fetchTcyStakePosition = async ({
  address,
  prices,
}: FetchTcyStakePositionInput): Promise<ThorchainStakePosition | null> => {
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
    const currentAccruedRune =
      parseNumber(runeBalance?.amount) / runeDecimalFactor
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

    const blocksRemainingForNext = blocksPerDay - (lastBlock % blocksPerDay)
    const secondsRemaining = blocksRemainingForNext * thorchainBlockTimeSeconds
    nextPayout = new Date(Date.now() + secondsRemaining * 1000)
  } catch {
    // Silent fallback to base values
  }

  return {
    id: 'thor-stake-tcy',
    ticker: thorchainTokens.tcy.ticker,
    amount,
    type: 'stake',
    canUnstake: amount > 0n,
    fiatValue,
    estimatedReward,
    apr: convertAPYtoAPR(apyPercent),
    nextPayout,
    rewardTicker: runeCoin.ticker,
  }
}
