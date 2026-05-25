import { toBase64, toHex } from '@cosmjs/encoding'
import { TW } from '@trustwallet/wallet-core'
import { attempt } from '@vultisig/lib-utils/attempt'
import {
  MsgExec,
  MsgGrant,
  MsgRevoke,
} from 'cosmjs-types/cosmos/authz/v1beta1/tx'
import { MsgMultiSend, MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import {
  MsgGrantAllowance,
  MsgRevokeAllowance,
} from 'cosmjs-types/cosmos/feegrant/v1beta1/tx'
import {
  MsgDeposit,
  MsgSubmitProposal,
  MsgVote,
  MsgVoteWeighted,
} from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import {
  MsgBeginRedelegate,
  MsgCancelUnbondingDelegation,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

import {
  decodeMsgDelegateBondedTokens,
  decodeMsgDelegateToValidatorSet,
  decodeMsgRedelegateValidatorSet,
  decodeMsgSetValidatorSetPreference,
  decodeMsgUndelegateFromRebalancedValidatorSet,
  decodeMsgUndelegateFromValidatorSet,
  decodeMsgWithdrawDelegationRewards,
} from './osmosisValsetprefDecoders'

type CosmosMessage = { typeUrl: string; value: Uint8Array }

type KnownDecoder = (value: Uint8Array) => unknown

// Schemas bundled with cosmjs-types or @trustwallet/wallet-core. For anything
// else we surface the raw base64 instead of a field-numbered approximation —
// a partial decode without proper field names is more misleading than helpful
// for a "verify what you're signing" view.
const knownDecoders: Record<string, KnownDecoder> = {
  // Bank
  '/cosmos.bank.v1beta1.MsgSend': v => MsgSend.decode(v),
  '/cosmos.bank.v1beta1.MsgMultiSend': v => MsgMultiSend.decode(v),

  // Staking
  '/cosmos.staking.v1beta1.MsgDelegate': v => MsgDelegate.decode(v),
  '/cosmos.staking.v1beta1.MsgUndelegate': v => MsgUndelegate.decode(v),
  '/cosmos.staking.v1beta1.MsgBeginRedelegate': v =>
    MsgBeginRedelegate.decode(v),
  '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation': v =>
    MsgCancelUnbondingDelegation.decode(v),
  '/cosmos.staking.v1beta1.MsgCreateValidator': v =>
    MsgCreateValidator.decode(v),
  '/cosmos.staking.v1beta1.MsgEditValidator': v => MsgEditValidator.decode(v),

  // Distribution
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': v =>
    MsgWithdrawDelegatorReward.decode(v),
  '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission': v =>
    MsgWithdrawValidatorCommission.decode(v),
  '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress': v =>
    MsgSetWithdrawAddress.decode(v),
  '/cosmos.distribution.v1beta1.MsgFundCommunityPool': v =>
    MsgFundCommunityPool.decode(v),

  // Governance (v1beta1)
  '/cosmos.gov.v1beta1.MsgVote': v => MsgVote.decode(v),
  '/cosmos.gov.v1beta1.MsgVoteWeighted': v => MsgVoteWeighted.decode(v),
  '/cosmos.gov.v1beta1.MsgDeposit': v => MsgDeposit.decode(v),
  '/cosmos.gov.v1beta1.MsgSubmitProposal': v => MsgSubmitProposal.decode(v),

  // Authz
  '/cosmos.authz.v1beta1.MsgGrant': v => MsgGrant.decode(v),
  '/cosmos.authz.v1beta1.MsgRevoke': v => MsgRevoke.decode(v),
  '/cosmos.authz.v1beta1.MsgExec': v => MsgExec.decode(v),

  // Feegrant
  '/cosmos.feegrant.v1beta1.MsgGrantAllowance': v =>
    MsgGrantAllowance.decode(v),
  '/cosmos.feegrant.v1beta1.MsgRevokeAllowance': v =>
    MsgRevokeAllowance.decode(v),

  // IBC + CosmWasm
  '/ibc.applications.transfer.v1.MsgTransfer': v => MsgTransfer.decode(v),
  '/cosmwasm.wasm.v1.MsgExecuteContract': v => MsgExecuteContract.decode(v),

  // THORChain (already used elsewhere in the codebase)
  '/types.MsgDeposit': v => TW.Cosmos.Proto.Message.THORChainDeposit.decode(v),
  '/types.MsgSend': v => TW.Cosmos.Proto.Message.THORChainSend.decode(v),

  // Osmosis valset-pref (hand-written — see osmosisValsetprefDecoders.ts)
  '/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference': v =>
    decodeMsgSetValidatorSetPreference(v),
  '/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet': v =>
    decodeMsgDelegateToValidatorSet(v),
  '/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet': v =>
    decodeMsgUndelegateFromValidatorSet(v),
  '/osmosis.valsetpref.v1beta1.MsgUndelegateFromRebalancedValidatorSet': v =>
    decodeMsgUndelegateFromRebalancedValidatorSet(v),
  '/osmosis.valsetpref.v1beta1.MsgRedelegateValidatorSet': v =>
    decodeMsgRedelegateValidatorSet(v),
  '/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards': v =>
    decodeMsgWithdrawDelegationRewards(v),
  '/osmosis.valsetpref.v1beta1.MsgDelegateBondedTokens': v =>
    decodeMsgDelegateBondedTokens(v),
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object'

const replaceJsonUnsafeValues = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Uint8Array) return toHex(value)
  if (Array.isArray(value)) return value.map(replaceJsonUnsafeValues)
  if (isPlainRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, replaceJsonUnsafeValues(v)])
    )
  }
  return value
}

/**
 * Decodes a Cosmos message payload (the `value` bytes inside `Any`) into a
 * JSON-serializable shape suitable for display. Returns a typed object for
 * message types whose schema we bundle; for chain-specific types we don't
 * recognize, returns the raw base64 so the user sees an unambiguous blob
 * rather than a half-decoded approximation with field numbers.
 */
export const decodeCosmosMessageValue = (msg: CosmosMessage): unknown => {
  const known = knownDecoders[msg.typeUrl]
  if (known) {
    const result = attempt(() => known(msg.value))
    if ('data' in result) return replaceJsonUnsafeValues(result.data)
  }
  return toBase64(msg.value)
}
