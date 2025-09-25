import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, EvmChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { formatAmount } from '@lib/utils/formatAmount'

import { getFeeUnit } from './feeUnit'

type FormatFeeInput = {
  chain: Chain
  amount: bigint
}

export const formatFee = ({ chain, amount }: FormatFeeInput) => {
  const decimals = isOneOf(chain, Object.values(EvmChain))
    ? gwei.decimals
    : chainFeeCoin[chain].decimals

  return formatAmount(fromChainAmount(amount, decimals), {
    ticker: getFeeUnit(chain),
  })
}
