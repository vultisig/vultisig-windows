import { BinaryReader } from 'cosmjs-types/binary'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'

// Hand-written protobuf decoders for the Osmosis `valset-pref` module's
// transaction messages. The schemas come from
// github.com/osmosis-labs/osmosis/blob/main/proto/osmosis/valset-pref/v1beta1
// (paths: `tx.proto` and `valset-pref.proto`).
//
// We hand-roll these instead of pulling in `osmojs` because `osmojs` ships
// every Osmosis module's generated bindings (~50 MB) and we only need a
// handful of message types for the keysign popup's display. Adding messages
// is cheap — copy the proto, mirror the field numbers, return a plain object.

type ValidatorPreference = {
  valOperAddress: string
  weight: string
}

const decodeValidatorPreference = (bytes: Uint8Array): ValidatorPreference => {
  const reader = new BinaryReader(bytes)
  const out: ValidatorPreference = { valOperAddress: '', weight: '' }
  while (reader.pos < reader.len) {
    const tag = reader.uint32()
    const fieldNo = tag >>> 3
    if (fieldNo === 1) {
      out.valOperAddress = reader.string()
    } else if (fieldNo === 2) {
      out.weight = reader.string()
    } else {
      reader.skipType(tag & 7)
    }
  }
  return out
}

type MsgSetValidatorSetPreference = {
  delegator: string
  preferences: ValidatorPreference[]
}

export const decodeMsgSetValidatorSetPreference = (
  bytes: Uint8Array
): MsgSetValidatorSetPreference => {
  const reader = new BinaryReader(bytes)
  const out: MsgSetValidatorSetPreference = { delegator: '', preferences: [] }
  while (reader.pos < reader.len) {
    const tag = reader.uint32()
    const fieldNo = tag >>> 3
    if (fieldNo === 1) {
      out.delegator = reader.string()
    } else if (fieldNo === 2) {
      out.preferences.push(decodeValidatorPreference(reader.bytes()))
    } else {
      reader.skipType(tag & 7)
    }
  }
  return out
}

type DelegatorAndCoin = {
  delegator: string
  coin: Coin | undefined
}

type DecodeDelegatorAndCoinInput = {
  bytes: Uint8Array
  coinFieldNo: number
}

// `MsgDelegateToValidatorSet` and `MsgUndelegateFromRebalancedValidatorSet`
// share this shape: { delegator string = 1; Coin coin = 2 }.
const decodeDelegatorAndCoin = ({
  bytes,
  coinFieldNo,
}: DecodeDelegatorAndCoinInput): DelegatorAndCoin => {
  const reader = new BinaryReader(bytes)
  const out: DelegatorAndCoin = { delegator: '', coin: undefined }
  while (reader.pos < reader.len) {
    const tag = reader.uint32()
    const fieldNo = tag >>> 3
    if (fieldNo === 1) {
      out.delegator = reader.string()
    } else if (fieldNo === coinFieldNo) {
      out.coin = Coin.decode(reader.bytes())
    } else {
      reader.skipType(tag & 7)
    }
  }
  return out
}

export const decodeMsgDelegateToValidatorSet = (
  bytes: Uint8Array
): DelegatorAndCoin => decodeDelegatorAndCoin({ bytes, coinFieldNo: 2 })

// NOTE: in the Osmosis proto, `MsgUndelegateFromValidatorSet.coin` is field 3
// (field 2 is reserved/skipped in the schema). Don't "normalize" it to 2.
export const decodeMsgUndelegateFromValidatorSet = (
  bytes: Uint8Array
): DelegatorAndCoin => decodeDelegatorAndCoin({ bytes, coinFieldNo: 3 })

export const decodeMsgUndelegateFromRebalancedValidatorSet = (
  bytes: Uint8Array
): DelegatorAndCoin => decodeDelegatorAndCoin({ bytes, coinFieldNo: 2 })

export const decodeMsgRedelegateValidatorSet = (
  bytes: Uint8Array
): MsgSetValidatorSetPreference => decodeMsgSetValidatorSetPreference(bytes)

type MsgWithdrawDelegationRewards = { delegator: string }

export const decodeMsgWithdrawDelegationRewards = (
  bytes: Uint8Array
): MsgWithdrawDelegationRewards => {
  const reader = new BinaryReader(bytes)
  const out: MsgWithdrawDelegationRewards = { delegator: '' }
  while (reader.pos < reader.len) {
    const tag = reader.uint32()
    if (tag >>> 3 === 1) {
      out.delegator = reader.string()
    } else {
      reader.skipType(tag & 7)
    }
  }
  return out
}

type MsgDelegateBondedTokens = { delegator: string; lockID: string }

export const decodeMsgDelegateBondedTokens = (
  bytes: Uint8Array
): MsgDelegateBondedTokens => {
  const reader = new BinaryReader(bytes)
  const out: MsgDelegateBondedTokens = { delegator: '', lockID: '0' }
  while (reader.pos < reader.len) {
    const tag = reader.uint32()
    const fieldNo = tag >>> 3
    if (fieldNo === 1) {
      out.delegator = reader.string()
    } else if (fieldNo === 2) {
      out.lockID = reader.uint64().toString()
    } else {
      reader.skipType(tag & 7)
    }
  }
  return out
}
