import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

export const tonConfig = {
  baseFee: toChainAmount(0.01, chainFeeCoin[Chain.Ton].decimals),
  jettonAmount: toChainAmount(0.08, chainFeeCoin[Chain.Ton].decimals),
}
