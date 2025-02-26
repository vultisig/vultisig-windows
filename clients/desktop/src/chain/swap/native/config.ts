import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

export const nativeSwapDecimals = chainFeeCoin[Chain.THORChain].decimals
