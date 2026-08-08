import { create } from '@bufbuild/protobuf'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignDirectSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import {
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { getPrimaryCosmosMessageTypeUrl } from './getPrimaryCosmosMessageTypeUrl'

const toBodyBytesBase64 = (
  messages: { typeUrl: string; value: Uint8Array }[]
): string =>
  Buffer.from(
    TxBody.encode(TxBody.fromPartial({ messages, memo: '' })).finish()
  ).toString('base64')

const signDirectPayload = (bodyBytes: string) =>
  create(KeysignPayloadSchema, {
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, { bodyBytes }),
    },
  })

describe('getPrimaryCosmosMessageTypeUrl', () => {
  it('extracts the typeUrl of a single staking message', () => {
    const bodyBytes = toBodyBytesBase64([
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        value: MsgDelegate.encode({
          delegatorAddress: 'qbtc1aaa',
          validatorAddress: 'qbtcvaloper1xyz',
          amount: { denom: 'uqbtc', amount: '1000000' },
        }).finish(),
      },
    ])

    expect(getPrimaryCosmosMessageTypeUrl(signDirectPayload(bodyBytes))).toBe(
      '/cosmos.staking.v1beta1.MsgDelegate'
    )
  })

  it('uses the primary (first) message for a multi-message tx', () => {
    const bodyBytes = toBodyBytesBase64([
      {
        typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
        value: MsgUndelegate.encode({
          delegatorAddress: 'qbtc1aaa',
          validatorAddress: 'qbtcvaloper1xyz',
          amount: { denom: 'uqbtc', amount: '5' },
        }).finish(),
      },
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: MsgSend.encode({
          fromAddress: 'qbtc1aaa',
          toAddress: 'qbtc1bbb',
          amount: [{ denom: 'uqbtc', amount: '1' }],
        }).finish(),
      },
    ])

    expect(getPrimaryCosmosMessageTypeUrl(signDirectPayload(bodyBytes))).toBe(
      '/cosmos.staking.v1beta1.MsgUndelegate'
    )
  })

  it('returns undefined when signData is not signDirect', () => {
    const payload = create(KeysignPayloadSchema, {})
    expect(getPrimaryCosmosMessageTypeUrl(payload)).toBeUndefined()
  })

  it('returns undefined when bodyBytes cannot be decoded', () => {
    expect(
      getPrimaryCosmosMessageTypeUrl(signDirectPayload('not-valid-base64-$$$'))
    ).toBeUndefined()
  })
})
