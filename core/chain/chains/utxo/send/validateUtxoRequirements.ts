import { UtxoBasedChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { formatAmount } from '@lib/utils/formatAmount'

import { fromChainAmount } from '../../../amount/fromChainAmount'
import { minUtxo } from '../minUtxo'

type Input = {
  amount: bigint
  balance: bigint
  chain: UtxoBasedChain
  /**
   * When set (native fee coin), change after send is `balance - amount - fee`.
   * Omit for assets where the fee is paid from a different balance.
   */
  fee?: bigint
  /**
   * Skip dust/change validation when the fee is not yet known (avoids false positives).
   */
  skipDustCheck?: boolean
}

/**
 * Validates minimum send and change (dust) rules for UTXO chains.
 * For native fee coins, pass `fee` so change is `balance - amount - fee`, not `balance - amount`.
 */
export const validateUtxoRequirements = ({
  amount,
  balance,
  chain,
  fee,
  skipDustCheck,
}: Input): string | undefined => {
  const { decimals, ticker } = chainFeeCoin[chain]

  if (amount < minUtxo[chain]) {
    const formattedAmount = formatAmount(
      fromChainAmount(minUtxo[chain], decimals),
      { ticker }
    )
    return `Minimum send amount is ${formattedAmount}. ${chain} requires this to prevent spam.`
  }

  if (skipDustCheck) {
    return
  }

  const remainingBalance =
    fee != null ? balance - amount - fee : balance - amount

  if (remainingBalance === 0n) {
    return
  }

  if (remainingBalance < minUtxo[chain]) {
    return `This amount would leave too little change. 💡 Try 'Max' to avoid this issue.`
  }
}
