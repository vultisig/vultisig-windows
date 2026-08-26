import { Chain } from '@vultisig/core-chain/Chain'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'
import { order } from '@vultisig/lib-utils/array/order'
import { sum } from '@vultisig/lib-utils/array/sum'
import { EntityWithPrice } from '@vultisig/lib-utils/entities/EntityWithPrice'
import { toEntries } from '@vultisig/lib-utils/record/toEntries'

import { VaultChainCoin } from './useVaultChainCoinsQuery'

/** Every portfolio coin of one chain with its resolved balance and price. */
export type VaultChainBalance = {
  chain: Chain
  coins: VaultChainCoin[]
}

/**
 * Portfolio balances resolved per chain: `balances` holds every chain whose
 * coins all have a balance (ordered by fiat value, highest first),
 * `failedChains` the chains where a balance read failed and `loadingChains`
 * the chains still waiting for a first balance.
 */
export type VaultChainsBalances = {
  balances: VaultChainBalance[]
  loadingChains: Chain[]
  failedChains: Chain[]
}

type ResolveVaultChainsBalancesInput = {
  coins: AccountCoin[]
  balances: Record<string, bigint> | undefined
  prices: Record<string, number> | undefined
  failedCoins: string[]
}

type ResolvedChainCoin = VaultChainCoin & EntityWithPrice

type ResolvedChainBalance = {
  chain: Chain
  coins: ResolvedChainCoin[]
}

const getBalanceKey = (coin: AccountCoin) =>
  accountCoinKeyToString(extractAccountCoinKey(coin))

const resolveChainCoins = ({
  coins,
  balances,
  prices,
}: Pick<ResolveVaultChainsBalancesInput, 'coins' | 'balances' | 'prices'>):
  | ResolvedChainCoin[]
  | undefined => {
  const chainCoins: ResolvedChainCoin[] = []

  for (const coin of coins) {
    const amount = balances?.[getBalanceKey(coin)]

    if (amount === undefined) {
      return undefined
    }

    chainCoins.push({
      ...coin,
      amount,
      price: prices?.[coinKeyToString(coin)] ?? 0,
    })
  }

  return chainCoins
}

/**
 * Resolves portfolio coins into per-chain balances, isolating a failure to the
 * chain it belongs to: a chain is resolved once every one of its coins has a
 * balance, failed when any of its coins' balance read failed, and loading
 * otherwise. Failure is judged per coin rather than from a global pending flag
 * so a failed chain stays failed while its read is retried in the background.
 * A missing balance is unknown, never zero.
 */
export const resolveVaultChainsBalances = ({
  coins,
  balances,
  prices,
  failedCoins,
}: ResolveVaultChainsBalancesInput): VaultChainsBalances => {
  const failedCoinKeys = new Set(failedCoins)
  const resolvedBalances: ResolvedChainBalance[] = []
  const loadingChains: Chain[] = []
  const failedChains: Chain[] = []

  const chains = toEntries(groupItems(coins, coin => coin.chain))

  for (const { key: chain, value: chainCoins } of chains) {
    const resolvedCoins = resolveChainCoins({
      coins: chainCoins,
      balances,
      prices,
    })

    if (resolvedCoins) {
      resolvedBalances.push({ chain, coins: resolvedCoins })
    } else if (
      chainCoins.some(coin => failedCoinKeys.has(getBalanceKey(coin)))
    ) {
      failedChains.push(chain)
    } else {
      loadingChains.push(chain)
    }
  }

  return {
    balances: order(
      resolvedBalances,
      ({ coins }) => sum(coins.map(getCoinValue)),
      'desc'
    ),
    loadingChains,
    failedChains,
  }
}
