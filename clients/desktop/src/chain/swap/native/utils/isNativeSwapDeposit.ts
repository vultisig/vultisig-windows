import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { NativeSwapChain } from '../NativeSwapChain'

type IsNativeSwapDepositInput = {
  fromCoin: CoinKey
  swapChain: NativeSwapChain
}

export const isNativeSwapDeposit = ({
  fromCoin,
  swapChain,
}: IsNativeSwapDepositInput): boolean =>
  isFeeCoin(fromCoin) && fromCoin.chain === swapChain
