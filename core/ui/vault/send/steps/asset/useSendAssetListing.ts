import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import {
  AccountCoin,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'

import { useCoinPricesQuery } from '../../../../chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '../../../../chain/coin/queries/useBalancesQuery'
import {
  useCurrentVaultChains,
  usePortfolioVaultCoins,
} from '../../../state/currentVaultCoins'
import { useCurrentSendCoin } from '../../state/sendCoin'
import { getSendAssetListing, SendChainFilter } from './getSendAssetListing'

type UseSendAssetListingInput = {
  filter: SendChainFilter
  query: string
}

/**
 * The send asset list for the vault's portfolio coins, valued with whatever
 * balances and prices have loaded so far.
 */
export const useSendAssetListing = ({
  filter,
  query,
}: UseSendAssetListingInput) => {
  const coins = usePortfolioVaultCoins()
  const chains = useCurrentVaultChains()
  const selectedCoin = useCurrentSendCoin()
  const { data: balances } = useBalancesQuery(coins.map(extractAccountCoinKey))
  const { data: prices } = useCoinPricesQuery({ coins })

  const getFiatValue = (coin: AccountCoin) => {
    const balance =
      balances?.[accountCoinKeyToString(extractAccountCoinKey(coin))]
    const price = prices?.[coinKeyToString(coin)]
    if (balance === undefined || price === undefined) return 0

    return fromChainAmount(balance, coin.decimals) * price
  }

  return getSendAssetListing({
    coins,
    chains,
    getFiatValue,
    filter,
    query,
    selectedCoin,
  })
}
