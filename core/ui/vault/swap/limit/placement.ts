import { Chain } from '@vultisig/core-chain/Chain'
import { isThorchainRoutable } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

/**
 * Why the chosen pair cannot carry a limit order.
 *
 * Every reason here depends on the pair alone, so it is answerable while the
 * user is still choosing assets — before an amount or a price exists.
 */
export type LimitPairBlocker =
  | 'queueUnavailable'
  | 'pairNotRoutable'
  | 'chainUnavailable'
  | 'sameAsset'
  | 'noDestination'
  | 'noMarketPrice'

/** A pair-level reason, or one that only exists once the order has inputs. */
export type LimitOrderBlocker =
  | LimitPairBlocker
  | 'noAmount'
  | 'insufficientBalance'
  | 'noPrice'
  | 'memoInvalid'

type GetLimitPairBlockerInput = {
  fromChain: Chain
  toChain: Chain
  /** Whether the two sides are the same asset. */
  isSameAsset: boolean
  /** Live `EnableAdvSwapQueue` state; `undefined` while still loading. */
  isQueueEnabled: boolean | undefined
  /** Chains with a live, non-halted inbound; `undefined` while still loading. */
  supportedChains: Chain[] | undefined
  /** A successful market-price probe doubles as proof the pair has a pool. */
  marketPrice: number | undefined
  /** The user's address on the target chain, where a filled order pays out. */
  destinationAddress: string | undefined
}

type GetLimitOrderBlockerInput = GetLimitPairBlockerInput & {
  amount: bigint | null
  /** Spendable balance; `undefined` while still loading. */
  balance: bigint | undefined
  price: number | null
  /** Error thrown while building the memo, if any. */
  memoError: string | undefined
}

/**
 * The single reason the pair cannot carry a limit order, or `undefined` when it
 * can.
 *
 * Split out from the full gate so the asset step can answer "is this pair
 * tradeable?" the moment the pair is chosen, rather than making the user price
 * an order to find out it was never placeable.
 *
 * Fails closed on every live gate — while `isQueueEnabled`, `supportedChains`,
 * or the market probe are still resolving the pair reads as blocked, because
 * the underlying services already resolve their own failures to "unavailable"
 * rather than throwing.
 */
export const getLimitPairBlocker = ({
  fromChain,
  toChain,
  isSameAsset,
  isQueueEnabled,
  supportedChains,
  marketPrice,
  destinationAddress,
}: GetLimitPairBlockerInput): LimitPairBlocker | undefined => {
  if (!isQueueEnabled) {
    return 'queueUnavailable'
  }

  if (!isThorchainRoutable(fromChain) || !isThorchainRoutable(toChain)) {
    return 'pairNotRoutable'
  }

  if (
    !supportedChains ||
    !isOneOf(fromChain, supportedChains) ||
    !isOneOf(toChain, supportedChains)
  ) {
    return 'chainUnavailable'
  }

  if (isSameAsset) {
    return 'sameAsset'
  }

  // The filled order pays out to the user's own address on the target chain; it
  // is encoded in the memo, so a missing one cannot be signed.
  if (!destinationAddress?.trim()) {
    return 'noDestination'
  }

  // A probe that came back proves a pool exists for the pair. Without it the
  // presets have nothing to anchor to and the pair may simply be unroutable.
  return marketPrice ? undefined : 'noMarketPrice'
}

/**
 * The single reason placement is blocked, or `undefined` when an order can be
 * placed.
 *
 * Ordered so the most fundamental problem wins: there is no point telling
 * someone their amount is missing when the pair cannot be routed at all, which
 * is why every pair-level reason is resolved first.
 */
export const getLimitOrderBlocker = ({
  amount,
  balance,
  price,
  memoError,
  ...pair
}: GetLimitOrderBlockerInput): LimitOrderBlocker | undefined => {
  const pairBlocker = getLimitPairBlocker(pair)
  if (pairBlocker) {
    return pairBlocker
  }

  if (amount === null || amount <= 0n) {
    return 'noAmount'
  }

  // Fails closed like the gates above: while the balance query is loading,
  // affordability is unknown, so placement stays blocked rather than letting an
  // unaffordable order through to signing.
  if (balance === undefined || amount > balance) {
    return 'insufficientBalance'
  }

  if (price === null || price <= 0) {
    return 'noPrice'
  }

  return memoError ? 'memoInvalid' : undefined
}

type GetLimitBlockerNoticeInput = {
  blocker: LimitOrderBlocker | undefined
  isQueueEnabled: boolean | undefined
  supportedChains: Chain[] | undefined
  balance: bigint | undefined
  /**
   * Whether the market-price probe is still in flight. Needed explicitly because
   * a missing price means either "still asking" or "THORChain has no pool for
   * this pair", and only the second is a verdict.
   */
  isMarketPriceLoading: boolean
}

/**
 * The blocker worth putting in front of the user, or `undefined` when the only
 * thing standing in the way is a gate that has not answered yet.
 *
 * The gates fail closed, which is right for a disabled button and wrong for a
 * message: announcing "temporarily unavailable" from a probe that is still
 * running — then withdrawing it a frame later — teaches the user to distrust
 * every notice the form shows. Placement stays blocked either way; only the
 * text is withheld.
 */
export const getLimitBlockerNotice = ({
  blocker,
  isQueueEnabled,
  supportedChains,
  balance,
  isMarketPriceLoading,
}: GetLimitBlockerNoticeInput): LimitOrderBlocker | undefined => {
  if (!blocker) {
    return undefined
  }

  const isUnresolved: Record<LimitOrderBlocker, boolean> = {
    queueUnavailable: isQueueEnabled === undefined,
    chainUnavailable: supportedChains === undefined,
    insufficientBalance: balance === undefined,
    noMarketPrice: isMarketPriceLoading,
    pairNotRoutable: false,
    sameAsset: false,
    noDestination: false,
    noAmount: false,
    noPrice: false,
    memoInvalid: false,
  }

  return isUnresolved[blocker] ? undefined : blocker
}
