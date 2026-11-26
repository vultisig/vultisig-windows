import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'

type ComputeVaultTotalValueInput = {
  coins: AccountCoin[]
  // Maps `accountCoinKeyToString(coin)` -> raw balance amount. Matches the
  // shape produced by `getBalanceQueryOptions` in `useBalancesQuery`.
  balances: Record<string, bigint>
  // Maps `coinKeyToString(coin)` -> fiat price. Matches the shape produced
  // by `useCoinPricesQuery`.
  prices: Record<string, number>
  /** DeFi value the wallet coins don't hold; `undefined` leaves the total wallet-only. */
  defiNotInWalletFiat: number | undefined
}

// Pure helper used by `useVaultsTotalBalances`. Extracted so the arithmetic
// can be tested in isolation.
export const computeVaultTotalValue = ({
  coins,
  balances,
  prices,
  defiNotInWalletFiat,
}: ComputeVaultTotalValueInput): number => {
  const walletValue = coins.reduce((sum, coin) => {
    const priceKey = coinKeyToString(coin)
    const balanceKey = accountCoinKeyToString(extractAccountCoinKey(coin))

    if (!(priceKey in prices) || !(balanceKey in balances)) {
      return sum
    }

    const price = prices[priceKey]
    const amount = balances[balanceKey]

    if (price === 0) {
      return sum
    }

    return (
      sum +
      getCoinValue({
        amount,
        decimals: coin.decimals,
        price,
      })
    )
  }, 0)

  return defiNotInWalletFiat === undefined
    ? walletValue
    : walletValue + defiNotInWalletFiat
}
