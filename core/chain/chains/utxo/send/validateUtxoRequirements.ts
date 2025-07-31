import { UtxoBasedChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

import { fromChainAmount } from '../../../amount/fromChainAmount'
import { minUtxo } from '../minUtxo'

type Input = {
  amount: bigint
  balance: bigint
  chain: UtxoBasedChain
}

export const validateUtxoRequirements = ({
  amount,
  balance,
  chain,
}: Input): string | undefined => {
  const { decimals, ticker } = chainFeeCoin[chain]

  if (amount < minUtxo[chain]) {
    const formattedAmount = formatTokenAmount(
      fromChainAmount(minUtxo[chain], decimals),
      ticker
    )
    return `Minimum send amount is ${formattedAmount}. ${chain} requires this to prevent spam.`
  }

  const remainingBalance = balance - amount

  if (remainingBalance === 0n) {
    return
  }

  if (remainingBalance < minUtxo[chain]) {
    return `This amount would leave too little change. 💡 Try 'Max' to avoid this issue.`
  }
}
