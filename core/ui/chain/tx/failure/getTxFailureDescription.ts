import {
  TonTxFailureReason,
  tonTxFailureReasons,
} from '@vultisig/core-chain/chains/ton/failure'
import { TxFailureInfo } from '@vultisig/core-chain/tx/status'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { TFunction } from 'i18next'

const tonTxFailureKeys = {
  'seqno-mismatch': 'ton_tx_failure_seqno_mismatch',
  expired: 'ton_tx_failure_expired',
  'invalid-signature': 'ton_tx_failure_invalid_signature',
  'wallet-id-mismatch': 'ton_tx_failure_wallet_id_mismatch',
  'insufficient-funds': 'ton_tx_failure_insufficient_funds',
  'out-of-gas': 'ton_tx_failure_out_of_gas',
  'invalid-destination': 'ton_tx_failure_invalid_destination',
  'not-enough-jettons': 'ton_tx_failure_not_enough_jettons',
  'jetton-gas-underfunded': 'ton_tx_failure_jetton_gas_underfunded',
  'jetton-unauthorized': 'ton_tx_failure_jetton_unauthorized',
  'action-failed': 'ton_tx_failure_action_failed',
  aborted: 'ton_tx_failure_aborted',
  'contract-rejected': 'ton_tx_failure_contract_rejected',
} as const satisfies Record<TonTxFailureReason, string>

type GetTxFailureDescriptionInput = {
  failure: TxFailureInfo
  t: TFunction
}

/**
 * The sentence shown to a user for a failed transaction: the translated
 * explanation and remedy for a reason this app knows (TON's wallet-contract
 * and fee failures), or the SDK's own English message for one it does not.
 */
export const getTxFailureDescription = ({
  failure,
  t,
}: GetTxFailureDescriptionInput): string =>
  isOneOf(failure.reason, tonTxFailureReasons)
    ? t(tonTxFailureKeys[failure.reason], { exitCode: failure.exitCode })
    : failure.message
