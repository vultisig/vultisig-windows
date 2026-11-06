import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { ValueProp } from '@lib/ui/props'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { SolanaRawTxFeeAmount } from './SolanaRawTxFeeAmount'

/**
 * The network fee of a revoke payload: the raw Solana transaction's own fee,
 * or the regular keysign fee for an EVM call.
 */
export const RevokeFeeAmount = ({ value }: ValueProp<KeysignPayload>) =>
  value.signData.case === 'signSolana' ? (
    <SolanaRawTxFeeAmount value={value.signData.value.rawTransactions[0]} />
  ) : (
    <KeysignFeeAmount keysignPayload={value} />
  )
