import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

import { fromChainAmount } from '../../../amount/fromChainAmount'
import { cardanoMinSendAmount } from '../config'

type Input = {
  amount: bigint
  balance: bigint
}

export const validateCardanoUtxoRequirements = ({
  amount,
  balance,
}: Input): string | undefined => {
  const { decimals, ticker } = chainFeeCoin[Chain.Cardano]

  if (amount < cardanoMinSendAmount) {
    const formattedAmount = formatTokenAmount(
      fromChainAmount(cardanoMinSendAmount, decimals),
      ticker
    )
    return `Minimum send amount is ${formattedAmount}. Cardano requires this to prevent spam.`
  }

  const remainingBalance = balance - amount

  if (remainingBalance === 0n) {
    return
  }

  if (remainingBalance < cardanoMinSendAmount) {
    return `This amount would leave too little change. 💡 Try 'Max' to avoid this issue.`
  }
}
