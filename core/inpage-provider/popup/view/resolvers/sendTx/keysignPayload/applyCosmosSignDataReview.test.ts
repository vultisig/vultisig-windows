import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignDirectSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { applyCosmosSignDataReview } from './applyCosmosSignDataReview'

const send = (toAddress: string, denom: string, amount: string) => ({
  typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  value: MsgSend.encode({
    fromAddress: 'cosmos1vault',
    toAddress,
    amount: [{ denom, amount }],
  }).finish(),
})

const payloadWith = (messages: ReturnType<typeof send>[]) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, {
      chain: Chain.Cosmos,
      ticker: 'ATOM',
      decimals: 6,
      isNativeToken: true,
    }),
    toAddress: 'cosmos1shown',
    toAmount: '1',
    memo: 'shown memo',
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        bodyBytes: Buffer.from(
          TxBody.encode(
            TxBody.fromPartial({ messages, memo: 'signed memo' })
          ).finish()
        ).toString('base64'),
      }),
    },
  })

describe('applyCosmosSignDataReview', () => {
  it('replaces the summary fields with the signed transfer', () => {
    const payload = payloadWith([send('cosmos1signed', 'uatom', '5')])

    applyCosmosSignDataReview(payload)

    expect(payload).toMatchObject({
      toAddress: 'cosmos1signed',
      toAmount: '5',
      memo: 'signed memo',
    })
  })

  it('totals the payload coin and drops a recipient that is not shared', () => {
    const payload = payloadWith([
      send('cosmos1first', 'uatom', '1000000'),
      send('cosmos1second', 'uatom', '1000000000'),
      send('cosmos1first', 'uosmo', '7'),
    ])

    applyCosmosSignDataReview(payload)

    expect(payload).toMatchObject({ toAddress: '', toAmount: '1001000000' })
  })

  it('leaves a payload without sign data untouched', () => {
    const payload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, { chain: Chain.Cosmos, isNativeToken: true }),
      toAddress: 'cosmos1shown',
      toAmount: '1',
    })

    applyCosmosSignDataReview(payload)

    expect(payload).toMatchObject({ toAddress: 'cosmos1shown', toAmount: '1' })
  })
})
