import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

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
            liquidSize { amount }
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
          liquidSize?: { amount?: string } | null
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

const rujiReceiptDenom = shouldBePresent(
  thorchainTokens.sruji.id,
  'sRUJI receipt denom'
)

// On-chain sRUJI receipt balance — the amount the vault actually holds (and can
// send), read the same way sTCY reads its receipt. This is deliberately kept
// independent of the staking API's `bonded` field, which can report 0 even when
// receipt tokens are held. Returns `null` when the request fails, so a genuine
// zero balance stays distinct from an unknown one.
const fetchRujiReceiptBalance = async (
  address: string
): Promise<bigint | null> => {
  const result = await attempt(() =>
    queryUrl<{ balance?: { amount?: string } }>(
      `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${encodeURIComponent(rujiReceiptDenom)}`
    )
  )

  return 'data' in result ? parseBigint(result.data?.balance?.amount) : null
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
    const [response, heldAmount] = await Promise.all([
      getRujiStake(address),
      fetchRujiReceiptBalance(address),
    ])
    // `stakingV2` can contain entries for multiple pools; the first entry is not
    // guaranteed to be RUJI. Match iOS and select the RUJI pool by its bond asset
    // symbol so the APR, rewards and bonded amount come from the right pool
    // (blindly taking [0] can surface a different pool's APR entirely).
    const stake = response?.data?.node?.stakingV2?.find(
      entry => entry?.bonded?.asset?.metadata?.symbol?.toUpperCase() === 'RUJI'
    )
    const bondedAmount = parseBigint(stake?.bonded?.amount)
    // Display the auto-compounding value: the sRUJI receipt converted to RUJI at
    // the pool's current share price (the API's `liquidSize`), matching what the
    // Rujira app shows. Fall back to the raw on-chain receipt balance if the API
    // doesn't surface it, then to the API's `bonded` amount.
    const liquidSizeAmount = parseBigint(stake?.liquidSize?.amount)
    const amount =
      liquidSizeAmount > 0n ? liquidSizeAmount : (heldAmount ?? bondedAmount)
    const rewardsAmount =
      parseNumber(stake?.pendingRevenue?.amount) / rujiDecimalFactor
    const aprValue = parseNumber(stake?.pool?.summary?.apr?.value)
    const price = prices[coinKeyToString(thorchainTokens.ruji)] ?? 0

    const fiatValue = getCoinValue({
      amount,
      decimals: thorchainTokens.ruji.decimals,
      price,
    })

    return {
      id: 'thor-stake-ruji',
      ticker: thorchainTokens.ruji.ticker,
      amount,
      type: 'stake',
      canUnstake: amount > 0n,
      fiatValue,
      apr: aprValue * 100,
      rewards: rewardsAmount,
      rewardTicker: 'USDC',
    }
  } catch {
    return null
  }
}
