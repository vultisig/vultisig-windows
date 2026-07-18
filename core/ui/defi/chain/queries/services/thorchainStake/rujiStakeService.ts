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

// The Rujira staking API returns APR as a Bigint fixed-point rate scaled to 12
// decimal places: divide by 10^12 for the fractional rate (e.g. 37176753737 =>
// 0.0372 => 3.72%). `status` is only meaningful when 'AVAILABLE'; any other
// status (NOT_APPLICABLE, SOON) means no APR to show.
const rujiRateDecimalFactor = toDecimalFactor(12)

// The Rujira staking API's `AprStatus` enum; only `AVAILABLE` yields an APR.
type RujiAprStatus = 'AVAILABLE' | 'NOT_APPLICABLE' | 'SOON'

const parseRujiApr = (
  apr?: { value?: string | null; status?: RujiAprStatus | null } | null
): number | undefined => {
  if (!apr || (apr.status && apr.status !== 'AVAILABLE')) {
    return undefined
  }

  return (parseNumber(apr.value) / rujiRateDecimalFactor) * 100
}

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
            pool { summary { apr { value status } } }
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
            summary?: {
              apr?: {
                value?: string | null
                status?: RujiAprStatus | null
              } | null
            } | null
          } | null
        } | null> | null
      } | null
    } | null
  }>(rujiStakeApiUrl, {
    body: { query, variables },
  })
}

// `stakingV2` can contain entries for multiple pools; the first entry is not
// guaranteed to be RUJI. Select the RUJI pool by its bond asset symbol (matches
// iOS) so the display and unstake-transaction paths never diverge.
const findRujiStake = (response: Awaited<ReturnType<typeof getRujiStake>>) =>
  response?.data?.node?.stakingV2?.find(
    entry => entry?.bonded?.asset?.metadata?.symbol?.toUpperCase() === 'RUJI'
  )

const rujiReceiptDenom = shouldBePresent(
  thorchainTokens.sruji.id,
  'sRUJI receipt denom'
)

// On-chain sRUJI receipt balance — the exact share count the vault holds, used
// to size the `liquid.unbond` redemption (the funds it sends are receipt
// shares, not RUJI). Read the same way sTCY reads its receipt. Returns `null`
// when the request fails, so a genuine zero stays distinct from an unknown one.
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

/**
 * DeFi position id for the auto-compounding (sRUJI receipt / `liquid.unbond`)
 * RUJI position. Kept as the original `thor-stake-ruji` id so previously stored
 * selections keep resolving, and so a single "RUJI" manage tile gates both
 * positions (see {@link rujiBondedStakePositionId}).
 */
export const rujiAutoCompoundStakePositionId = 'thor-stake-ruji'

/**
 * DeFi position id for the bonded (yielding / `account.withdraw`) RUJI position.
 * Rendered alongside the auto-compounding card in the Staked tab; it has no
 * manage tile of its own and is gated by the `thor-stake-ruji` selection.
 */
export const rujiBondedStakePositionId = 'thor-stake-ruji-bonded'

type RujiStakeSnapshot = {
  /** Auto-compounding position valued in RUJI base units (the API `liquidSize`). */
  autoCompoundAmount: bigint
  /** Bonded (yielding) position in RUJI base units. */
  bondedAmount: bigint
  /** Pending USDC revenue, human-readable. */
  rewardsAmount: number
  apr?: number
}

// Reads the Rujira staking API (APR, pending USDC revenue, bonded + liquid
// amounts) and derives the two independent RUJI positions. The auto-compounding
// amount is the API's `liquidSize` — the sRUJI receipt priced in RUJI, i.e. what
// the Rujira app shows. The raw on-chain receipt is in share units (not RUJI, so
// not a valid display value once the share price drifts) and is read separately
// only when building the `liquid.unbond` tx. `liquidSize` also does NOT fall
// back to `bonded`, which is surfaced as its own position.
const fetchRujiStakeSnapshot = async (
  address: string
): Promise<RujiStakeSnapshot> => {
  const stake = findRujiStake(await getRujiStake(address))

  return {
    autoCompoundAmount: parseBigint(stake?.liquidSize?.amount),
    bondedAmount: parseBigint(stake?.bonded?.amount),
    rewardsAmount:
      parseNumber(stake?.pendingRevenue?.amount) / rujiDecimalFactor,
    apr: parseRujiApr(stake?.pool?.summary?.apr),
  }
}

type FetchRujiStakePositionsInput = {
  address: string
  prices: Record<string, number>
}

type BuildPositionInput = {
  id: string
  amount: bigint
  extras?: Partial<ThorchainStakePosition>
}

/**
 * Fetches the vault's RUJI staking positions as separate
 * {@link ThorchainStakePosition}s: an auto-compounding (sRUJI) position and a
 * bonded position. Each is emitted only when it holds value, so a bonded-only
 * vault shows its bonded balance and an auto-compounding vault shows only the
 * compounded card; when neither holds value the bonded card is emitted with a
 * zero balance as an anchor to stake into. Returns `[]` if the lookup fails.
 *
 * The Rujira staking API's APR and pending USDC revenue belong to the bonded
 * position: the auto-compounding position reinvests its revenue into
 * `liquidSize` and has no separately-claimable USDC (like sTCY). So they ride on
 * the bonded card, and the compounded card stays stat-free.
 */
export const fetchRujiStakePositions = async ({
  address,
  prices,
}: FetchRujiStakePositionsInput): Promise<ThorchainStakePosition[]> => {
  const snapshot = await attempt(() => fetchRujiStakeSnapshot(address))
  if ('error' in snapshot) {
    return []
  }

  const { autoCompoundAmount, bondedAmount, rewardsAmount, apr } = snapshot.data
  const price = prices[coinKeyToString(thorchainTokens.ruji)] ?? 0

  const buildPosition = ({
    id,
    amount,
    extras = {},
  }: BuildPositionInput): ThorchainStakePosition => ({
    id,
    ticker: thorchainTokens.ruji.ticker,
    amount,
    type: 'stake',
    canUnstake: amount > 0n,
    fiatValue: getCoinValue({
      amount,
      decimals: thorchainTokens.ruji.decimals,
      price,
    }),
    ...extras,
  })

  // APR + pending USDC revenue ride on the bonded position (see the doc above).
  const bondedPosition = buildPosition({
    id: rujiBondedStakePositionId,
    amount: bondedAmount,
    extras: { apr, rewards: rewardsAmount, rewardTicker: 'USDC' },
  })

  const positions: ThorchainStakePosition[] = []
  if (autoCompoundAmount > 0n) {
    positions.push(
      buildPosition({
        id: rujiAutoCompoundStakePositionId,
        amount: autoCompoundAmount,
      })
    )
  }
  // Keep the bonded card visible while its USDC revenue is claimable, so those
  // rewards never get stranded even when the bonded RUJI balance is 0.
  if (bondedAmount > 0n || rewardsAmount > 0) {
    positions.push(bondedPosition)
  }
  if (positions.length === 0) {
    // Nothing staked: anchor with the bonded card, since "Stake" bonds
    // (`account.bond`) into exactly this position.
    positions.push(bondedPosition)
  }

  return positions
}

/** Base-unit RUJI balances available to unstake, per position. */
export type RujiUnstakeBalances = {
  /** Auto-compounding (sRUJI receipt) value in RUJI base units. */
  autoCompound: bigint
  /** Bonded (yielding) position in RUJI base units. */
  bonded: bigint
}

/**
 * Resolves the unstakable RUJI balances for both positions from the same source
 * as the Staked cards, so each unstake form's ceiling matches its card.
 */
export const fetchRujiUnstakeBalances = async (
  address: string
): Promise<RujiUnstakeBalances> => {
  const { autoCompoundAmount, bondedAmount } =
    await fetchRujiStakeSnapshot(address)

  return { autoCompound: autoCompoundAmount, bonded: bondedAmount }
}

type RujiLiquidUnbondInputs = {
  /** On-chain sRUJI receipt balance (base units) — the shares to redeem. */
  liquidShares: bigint
  /** RUJI-denominated value of the auto-compounding position (base units). */
  liquidSize: bigint
}

/**
 * Fetches the base-unit inputs needed to build a RUJI `liquid.unbond`
 * transaction. Unstaking the auto-compounding position redeems the sRUJI
 * receipt, so the entered underlying (RUJI) amount must be converted to receipt
 * shares via `liquidShares / liquidSize` — this returns both raw values.
 */
export const fetchRujiLiquidUnbondInputs = async (
  address: string
): Promise<RujiLiquidUnbondInputs> => {
  const [response, heldAmount] = await Promise.all([
    getRujiStake(address),
    fetchRujiReceiptBalance(address),
  ])
  const liquidSize = parseBigint(findRujiStake(response)?.liquidSize?.amount)

  // `heldAmount` is `null` only when the on-chain receipt lookup failed (a
  // genuine zero is `0n`). Redeeming a liquid position needs the real share
  // balance, so surface the failure instead of building an unbond that redeems
  // `0` shares. When there's no liquid position (`liquidSize === 0`) the caller
  // uses the bonded withdraw path, which doesn't need shares.
  if (heldAmount === null && liquidSize > 0n) {
    throw new Error('Unable to read sRUJI receipt balance for unstake')
  }

  return {
    liquidShares: heldAmount ?? 0n,
    liquidSize,
  }
}
