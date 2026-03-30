import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { UtxoBasedChain } from '@vultisig/core-chain/Chain'
import { minUtxo } from '@vultisig/core-chain/chains/utxo/minUtxo'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

type ValidateUtxoSendRequirementsInput = {
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
 * Minimum send and change (dust) rules for UTXO chains. Matches pre-SDK Windows behavior:
 * published `@vultisig/core-chain` `validateUtxoRequirements` omits `fee` / `skipDustCheck`.
 */
export const validateUtxoSendRequirements = ({
  amount,
  balance,
  chain,
  fee,
  skipDustCheck,
}: ValidateUtxoSendRequirementsInput): string | undefined => {
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
