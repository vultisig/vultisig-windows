import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

import { fromChainAmount } from '../../../amount/fromChainAmount'
import { cardanoDustStats, cardanoNeglectableUtxoChange } from '../config'

type Input = {
  amount: bigint
  balance: bigint
}

export const validateCardanoUtxoRequirements = ({
  amount,
  balance,
}: Input): string | undefined => {
  const { decimals, ticker } = chainFeeCoin[Chain.Cardano]

  if (amount < cardanoDustStats) {
    const formattedAmount = formatTokenAmount(
      fromChainAmount(cardanoDustStats, decimals),
      ticker
    )
    return `Minimum send amount is ${formattedAmount}. Cardano requires this to prevent spam.`
  }

  const remainingBalance = balance - amount

  if (remainingBalance <= cardanoNeglectableUtxoChange) {
    return
  }

  if (remainingBalance < cardanoDustStats) {
    return `This amount would leave too little change. 💡 Try 'Send Max' to avoid this issue.`
  }
}
