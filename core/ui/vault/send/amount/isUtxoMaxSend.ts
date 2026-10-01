import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'

type IsUtxoMaxSendInput = {
  chain: Chain
  amount: bigint
  balance: bigint
  fee: bigint
}

/**
 * Whether a UTXO send moves everything the balance can spend once the fee is
 * paid, which is what Max (or an amount clamped to the balance) produces. It
 * has to be signed as a max spend: planned as an ordinary send, the amount
 * leaves nothing to pay for a change output and the planner refuses it as
 * insufficient funds. Other chains sign the amount as given.
 */
export const isUtxoMaxSend = ({
  chain,
  amount,
  balance,
  fee,
}: IsUtxoMaxSendInput): boolean =>
  isChainOfKind(chain, 'utxo') &&
  amount > 0n &&
  amount === getMaxSendableAmount({ chain, balance, fee })
