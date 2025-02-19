import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinAmount } from '@core/chain/coin/Coin'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { order } from '@lib/utils/array/order'
import { splitBy } from '@lib/utils/array/splitBy'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { EntityWithPrice } from '@lib/utils/entities/EntityWithPrice'

export const sortCoinsByBalance = <
  T extends CoinAmount & Partial<EntityWithPrice>,
>(
  items: T[]
): T[] => {
  const [itemsWithBalance, itemsWithoutBalance] = splitBy(
    items,
    ({ amount }) => (amount ? 0 : 1)
  )

  const [itemsWithPrice, itemsWithoutPrice] = splitBy(
    itemsWithBalance,
    ({ price }) => (price ? 0 : 1)
  )

  return [
    ...order(
      itemsWithPrice,
      ({ price, amount, decimals }) =>
        getCoinValue({
          price: shouldBePresent(price),
          amount,
          decimals,
        }),
      'desc'
    ),
    ...order(
      itemsWithoutPrice,
      ({ amount, decimals }) => fromChainAmount(amount, decimals),
      'desc'
    ),
    ...itemsWithoutBalance,
  ]
}
