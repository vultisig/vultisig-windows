import { coinKeyToString } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { rujiStakeApiUrl } from '../../constants'
import { thorchainTokens } from '../../tokens'
import { ThorchainStakePosition } from '../../types'
import { toDecimalFactor } from '../../utils/decimals'
import { encodeBase64, parseBigint, parseNumber } from '../../utils/parsers'

const rujiDecimalFactor = toDecimalFactor(thorchainTokens.ruji.decimals)

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
          pool?: {
            summary?: { apr?: { value?: string | null } | null } | null
          } | null
        } | null> | null
      } | null
    } | null
  }>(rujiStakeApiUrl, {
    body: { query, variables },
  })
}

type FetchRujiStakePositionInput = {
  address: string
  prices: Record<string, number>
}

export const fetchRujiStakePosition = async ({
  address,
  prices,
}: FetchRujiStakePositionInput): Promise<ThorchainStakePosition | null> => {
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
      type: 'stake',
      canUnstake: bondedAmount > 0n,
      fiatValue,
      apr: aprValue * 100,
      rewards: rewardsAmount,
      rewardTicker: 'USDC',
    }
  } catch {
    return null
  }
}
