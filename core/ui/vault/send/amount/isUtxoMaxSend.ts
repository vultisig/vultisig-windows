import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'

type IsUtxoMaxSendInput = {
  chain: Chain
  amount: bigint
  balance: bigint
  /** The fee the send is signed with, at the fee settings chosen for it. */
  fee: bigint
}

/**
 * Whether a UTXO send has to be signed as a max spend: at the fee it is signed
 * with, the amount leaves nothing to pay for a change output, so an ordinary
 * plan is refused as insufficient funds. That is Max, an amount clamped to the
 * balance, or Max followed by a higher fee on Verify. The sweep then moves
 * everything left after that fee, which is never more than the amount. An
 * amount above the balance is a real over-entry and stays an ordinary send for
 * validation to reject. Other chains sign the amount as given.
 */
export const isUtxoMaxSend = ({
  chain,
  amount,
  balance,
  fee,
}: IsUtxoMaxSendInput): boolean => {
  if (!isChainOfKind(chain, 'utxo')) {
    return false
  }

  const maxSendable = getMaxSendableAmount({ chain, balance, fee })

  return maxSendable > 0n && amount >= maxSendable && amount <= balance
}
