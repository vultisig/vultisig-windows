import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignDirectSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import { MsgUndelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { getCosmosSignDataReview } from '../../tx/cosmos/getCosmosSignDataReview'
import { getJoinCosmosSignDataView } from './getJoinCosmosSignDataView'

type EncodedMessage = { typeUrl: string; value: Uint8Array }

const atom = { chain: Chain.Cosmos }

const viewOf = (messages: EncodedMessage[]) => {
  const keysignPayload = create(KeysignPayloadSchema, {
    coin: create(CoinSchema, { chain: Chain.Cosmos, isNativeToken: true }),
    toAddress: 'cosmos1shown',
    toAmount: '1',
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        bodyBytes: Buffer.from(
          TxBody.encode(TxBody.fromPartial({ messages })).finish()
        ).toString('base64'),
      }),
    },
  })

  return getJoinCosmosSignDataView({
    keysignPayload,
    review: shouldBePresent(getCosmosSignDataReview(keysignPayload)),
    coin: atom,
  })
}

const send = (toAddress: string, amount: string): EncodedMessage => ({
  typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  value: MsgSend.encode({
    fromAddress: 'cosmos1vault',
    toAddress,
    amount: [{ denom: 'uatom', amount }],
  }).finish(),
})

const undelegate: EncodedMessage = {
  typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
  value: MsgUndelegate.encode({
    delegatorAddress: 'cosmos1vault',
    validatorAddress: 'cosmosvaloper1validator',
    amount: { denom: 'uatom', amount: '500' },
  }).finish(),
}

describe('getJoinCosmosSignDataView', () => {
  it('keeps the card for a single transfer', () => {
    expect(viewOf([send('cosmos1signed', '5')])).toEqual({
      card: { receiver: 'cosmos1signed', amount: 5n },
    })
  })

  it('uses the overview for several transfers', () => {
    expect(viewOf([send('cosmos1a', '1'), send('cosmos1b', '2')])).toEqual({
      overview: true,
    })
  })

  it('reads a staking action from the signed data', () => {
    expect(viewOf([undelegate])).toEqual({
      card: { receiver: 'cosmosvaloper1validator', amount: 500n },
    })
  })

  it('drops the amount for an action that states none', () => {
    expect(
      viewOf([
        {
          typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
          value: MsgWithdrawDelegatorReward.encode({
            delegatorAddress: 'cosmos1vault',
            validatorAddress: 'cosmosvaloper1validator',
          }).finish(),
        },
      ])
    ).toEqual({
      card: { receiver: 'cosmosvaloper1validator', amount: undefined },
    })
  })

  it('uses the overview for mixed actions the signed data cannot prove', () => {
    expect(
      viewOf([
        undelegate,
        {
          typeUrl: '/cosmos.gov.v1beta1.MsgVote',
          value: MsgVote.encode({
            proposalId: 1n,
            voter: 'cosmos1vault',
            option: 1,
          }).finish(),
        },
      ])
    ).toEqual({ overview: true })
  })
})
