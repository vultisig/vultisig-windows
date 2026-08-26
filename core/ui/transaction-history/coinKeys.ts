import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoinKey,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'

type GetFeeCoinKeyInput = {
  chain: Chain
  address: string
}

/**
 * The balance key of a chain's fee coin at an address, trimmed to the bare
 * `{ chain, id, address }` shape balance queries are cached under.
 *
 * The trim is what makes the key usable as an invalidation filter: a filter
 * only matches a cached query when every one of its fields exists on the
 * cached key, so a key still carrying `chainFeeCoin`'s ticker, logo and
 * decimals would match nothing and the invalidation would silently do nothing.
 */
export const getFeeCoinKey = ({
  chain,
  address,
}: GetFeeCoinKeyInput): AccountCoinKey =>
  extractAccountCoinKey({ ...chainFeeCoin[chain], address })

/** Drops keys that name a balance already in the list, keeping the first. */
export const withoutDuplicateCoinKeys = (
  keys: AccountCoinKey[]
): AccountCoinKey[] =>
  withoutDuplicates(
    keys,
    (one, another) =>
      accountCoinKeyToString(one) === accountCoinKeyToString(another)
  )
