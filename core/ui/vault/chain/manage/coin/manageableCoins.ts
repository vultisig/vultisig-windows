import { areEqualCoins, Coin } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'

type ManageableCoinsInput = {
  /** Curated tokens we ship for the chain. */
  known: Coin[]
  /** Tokens fetched from the whitelist service for the chain. */
  whitelisted: Coin[]
  /** Every coin the vault currently holds on the chain, native fee coin included. */
  current: Coin[]
}

/**
 * Every token the manage-tokens screen can offer for a chain.
 *
 * Held tokens are appended so a token the vault already has is always listed —
 * a custom token the user added by id belongs to neither the curated set nor
 * the whitelist, and omitting it leaves the user unable to see or remove it.
 * They go last so curated metadata (logo, price provider) still wins for a
 * token present in both sources.
 *
 * The native fee coin is excluded: this screen manages tokens, and the chain's
 * own coin is not something the user can toggle off here.
 */
export const getManageableCoins = ({
  known,
  whitelisted,
  current,
}: ManageableCoinsInput): Coin[] =>
  withoutDuplicates(
    [...known, ...whitelisted, ...current.filter(coin => !isFeeCoin(coin))],
    areEqualCoins
  )
