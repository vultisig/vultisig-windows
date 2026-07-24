import { Chain } from '@vultisig/core-chain/Chain'
import { isThorchainRoutable } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

export type LimitOrderBlocker =
  | 'queueUnavailable'
  | 'pairNotRoutable'
  | 'chainUnavailable'
  | 'sameAsset'
  | 'noAmount'
  | 'insufficientBalance'
  | 'noPrice'
  | 'noMarketPrice'
  | 'noDestination'
  | 'memoInvalid'

type GetLimitOrderBlockerInput = {
  fromChain: Chain
  toChain: Chain
  /** Whether the two sides are the same asset. */
  isSameAsset: boolean
  amount: bigint | null
  balance: bigint | undefined
  price: number | null
  /** Live `EnableAdvSwapQueue` state; `undefined` while still loading. */
  isQueueEnabled: boolean | undefined
  /** Chains with a live, non-halted inbound; `undefined` while still loading. */
  supportedChains: Chain[] | undefined
  /** A successful market-price probe doubles as proof the pair has a pool. */
  marketPrice: number | undefined
  /** The user's address on the target chain, where a filled order pays out. */
  destinationAddress: string | undefined
  /** Error thrown while building the memo, if any. */
  memoError: string | undefined
}

/**
 * The single reason placement is blocked, or `undefined` when an order can be
 * placed.
 *
 * Ordered so the most fundamental problem wins: there is no point telling
 * someone their amount is missing when the pair cannot be routed at all.
 *
 * Fails closed on both live gates — while `isQueueEnabled` or `supportedChains`
 * are still loading the order stays blocked, because the underlying services
 * already resolve their own failures to "disabled" rather than throwing.
 */
export const getLimitOrderBlocker = ({
  fromChain,
  toChain,
  isSameAsset,
  amount,
  balance,
  price,
  isQueueEnabled,
  supportedChains,
  marketPrice,
  destinationAddress,
  memoError,
}: GetLimitOrderBlockerInput): LimitOrderBlocker | undefined => {
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

  if (amount === null || amount <= 0n) {
    return 'noAmount'
  }

  if (balance !== undefined && amount > balance) {
    return 'insufficientBalance'
  }

  if (price === null || price <= 0) {
    return 'noPrice'
  }

  // A probe that came back proves a pool exists for the pair. Without it the
  // presets have nothing to anchor to and the pair may simply be unroutable.
  if (!marketPrice) {
    return 'noMarketPrice'
  }

  // The filled order pays out to the user's own address on the target chain; it
  // is encoded in the memo, so a missing one cannot be signed.
  if (!destinationAddress?.trim()) {
    return 'noDestination'
  }

  return memoError ? 'memoInvalid' : undefined
}
