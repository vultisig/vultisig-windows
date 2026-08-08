import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignDirectSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1/tx'
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { getSignDataTxAction } from './getSignDataTxAction'

const bodyBytesBase64 = (
  messages: { typeUrl: string; value: Uint8Array }[]
): string =>
  Buffer.from(
    TxBody.encode(TxBody.fromPartial({ messages, memo: '' })).finish()
  ).toString('base64')

const qbtcSignDirectPayload = (
  messages: { typeUrl: string; value: Uint8Array }[]
) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, {
      chain: Chain.QBTC,
      ticker: 'QBTC',
      decimals: 8,
    }),
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        bodyBytes: bodyBytesBase64(messages),
      }),
    },
  })

const delegateMsg = {
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
  value: MsgDelegate.encode({
    delegatorAddress: 'qbtc1aaa',
    validatorAddress: 'qbtcvaloper1xyz',
    amount: { denom: 'qbtc', amount: '1000' },
  }).finish(),
}

describe('getSignDataTxAction — Cosmos staking/gov signDirect', () => {
  it('labels MsgDelegate as a delegate action', () => {
    const action = getSignDataTxAction(qbtcSignDirectPayload([delegateMsg]), 0)
    expect(action).toMatchObject({ action: 'delegate', labelKey: 'delegate' })
  })

  it('labels MsgUndelegate as an undelegate action', () => {
    const action = getSignDataTxAction(
      qbtcSignDirectPayload([
        {
          typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
          value: MsgUndelegate.encode({
            delegatorAddress: 'qbtc1aaa',
            validatorAddress: 'qbtcvaloper1xyz',
            amount: { denom: 'qbtc', amount: '1000' },
          }).finish(),
        },
      ]),
      0
    )
    expect(action).toMatchObject({
      action: 'undelegate',
      labelKey: 'undelegate',
    })
  })

  it('labels MsgBeginRedelegate as a redelegate action', () => {
    const action = getSignDataTxAction(
      qbtcSignDirectPayload([
        {
          typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
          value: MsgBeginRedelegate.encode({
            delegatorAddress: 'qbtc1aaa',
            validatorSrcAddress: 'qbtcvaloper1src',
            validatorDstAddress: 'qbtcvaloper1dst',
            amount: { denom: 'qbtc', amount: '1000' },
          }).finish(),
        },
      ]),
      0
    )
    expect(action).toMatchObject({
      action: 'redelegate',
      labelKey: 'redelegate',
    })
  })

  it('labels MsgVote as a vote action with no amount', () => {
    const action = getSignDataTxAction(
      qbtcSignDirectPayload([
        {
          typeUrl: '/cosmos.gov.v1.MsgVote',
          value: MsgVote.encode({
            proposalId: 1n,
            voter: 'qbtc1aaa',
            option: 1,
            metadata: '',
          }).finish(),
        },
      ]),
      0
    )
    expect(action).toEqual({ action: 'vote', labelKey: 'vote' })
  })

  it('labels MsgWithdrawDelegatorReward as a claim_rewards action', () => {
    const action = getSignDataTxAction(
      qbtcSignDirectPayload([
        {
          typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          value: MsgWithdrawDelegatorReward.encode({
            delegatorAddress: 'qbtc1aaa',
            validatorAddress: 'qbtcvaloper1xyz',
          }).finish(),
        },
      ]),
      0
    )
    expect(action).toEqual({
      action: 'claim_rewards',
      labelKey: 'claim_rewards',
    })
  })

  it('still labels MsgSend as a send action', () => {
    const action = getSignDataTxAction(
      qbtcSignDirectPayload([
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: MsgSend.encode({
            fromAddress: 'qbtc1aaa',
            toAddress: 'qbtc1bbb',
            amount: [{ denom: 'qbtc', amount: '1000' }],
          }).finish(),
        },
      ]),
      0
    )
    expect(action?.action).toBe('send')
  })

  it('uses the first staking message in a multi-message tx', () => {
    const action = getSignDataTxAction(
      qbtcSignDirectPayload([
        delegateMsg,
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: MsgSend.encode({
            fromAddress: 'qbtc1aaa',
            toAddress: 'qbtc1bbb',
            amount: [{ denom: 'qbtc', amount: '1' }],
          }).finish(),
        },
      ]),
      0
    )
    expect(action).toMatchObject({ action: 'delegate' })
  })
})
