import { UtxoChain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { minBigInt } from '@lib/utils/math/minBigInt'

type CapSendAmountToMaxInput = {
  coin: CoinKey
  amount: bigint
  fee: bigint
  balance: bigint
}

export const capSendAmountToMax = ({
  coin,
  amount,
  fee,
  balance,
}: CapSendAmountToMaxInput) => {
  if (!isFeeCoin(coin)) {
    return amount
  }

  if (isOneOf(coin.chain, Object.values(UtxoChain))) {
    return amount
  }

  return minBigInt(amount, balance - fee)
}
