import { create } from '@bufbuild/protobuf'
import { toBech32 } from '@cosmjs/encoding'
import { TW } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  CosmosMsgSchema,
  SignAminoSchema,
  SignDirectSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { describe, expect, it } from 'vitest'

import { getCosmosSignDataReview } from './getCosmosSignDataReview'

type EncodedMessage = { typeUrl: string; value: Uint8Array }

type DirectPayloadInput = {
  chain?: Chain
  messages: EncodedMessage[]
  memo?: string
  payloadMemo?: string
}

const directPayload = ({
  chain = Chain.Cosmos,
  messages,
  memo = '',
  payloadMemo,
}: DirectPayloadInput) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, { chain, isNativeToken: true }),
    memo: payloadMemo,
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        bodyBytes: Buffer.from(
          TxBody.encode(TxBody.fromPartial({ messages, memo })).finish()
        ).toString('base64'),
      }),
    },
  })

type AminoPayloadInput = {
  msgs: { type: string; value: string }[]
  memo?: string
}

const aminoPayload = ({ msgs, memo }: AminoPayloadInput) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, { chain: Chain.Cosmos, isNativeToken: true }),
    memo,
    signData: {
      case: 'signAmino',
      value: create(SignAminoSchema, {
        msgs: msgs.map(msg => create(CosmosMsgSchema, msg)),
      }),
    },
  })

const send = (toAddress: string, amount: string): EncodedMessage => ({
  typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  value: MsgSend.encode({
    fromAddress: 'cosmos1vault',
    toAddress,
    amount: [{ denom: 'uatom', amount }],
  }).finish(),
})

describe('getCosmosSignDataReview', () => {
  it('lists every transfer of a multi-message signDirect body', () => {
    const review = getCosmosSignDataReview(
      directPayload({
        messages: [
          send('cosmos1first', '1000000'),
          send('cosmos1second', '1000000000'),
        ],
      })
    )

    expect(review).toEqual({
      chain: Chain.Cosmos,
      transfers: [
        {
          recipient: 'cosmos1first',
          coin: { denom: 'uatom', amount: 1000000n },
        },
        {
          recipient: 'cosmos1second',
          coin: { denom: 'uatom', amount: 1000000000n },
        },
      ],
      memo: '',
      hasUnsummarizedMessages: false,
    })
  })

  it('reads the memo from the signed body, not the payload', () => {
    const review = getCosmosSignDataReview(
      directPayload({
        messages: [send('cosmos1first', '1')],
        memo: 'signed memo',
        payloadMemo: 'payload memo',
      })
    )

    expect(review?.memo).toBe('signed memo')
  })

  it('flags a message it cannot read and keeps the others', () => {
    const review = getCosmosSignDataReview(
      directPayload({
        messages: [
          send('cosmos1first', '1'),
          {
            typeUrl: '/cosmos.bank.v1beta1.MsgMultiSend',
            value: new Uint8Array(),
          },
        ],
      })
    )

    expect(review?.transfers).toHaveLength(1)
    expect(review?.hasUnsummarizedMessages).toBe(true)
  })

  it('treats inherited object keys as unknown message types', () => {
    expect(
      getCosmosSignDataReview(
        directPayload({
          messages: [{ typeUrl: 'constructor', value: new Uint8Array() }],
        })
      )
    ).toMatchObject({ transfers: [], hasUnsummarizedMessages: true })

    expect(
      getCosmosSignDataReview(
        aminoPayload({ msgs: [{ type: 'toString', value: '{}' }] })
      )
    ).toMatchObject({ transfers: [], hasUnsummarizedMessages: true })
  })

  it('flags a body that does not decode', () => {
    const payload = directPayload({ messages: [] })
    if (payload.signData.case !== 'signDirect') throw new Error('signDirect')
    payload.signData.value.bodyBytes = Buffer.from([0xff, 0xff]).toString(
      'base64'
    )

    expect(getCosmosSignDataReview(payload)).toMatchObject({
      transfers: [],
      hasUnsummarizedMessages: true,
    })
  })

  it('shows contract funds and flags the contract call itself', () => {
    const review = getCosmosSignDataReview(
      directPayload({
        messages: [
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.encode({
              sender: 'cosmos1vault',
              contract: 'cosmos1contract',
              msg: new TextEncoder().encode('{"swap":{}}'),
              funds: [{ denom: 'uatom', amount: '5' }],
            }).finish(),
          },
        ],
      })
    )

    expect(review).toMatchObject({
      transfers: [
        { recipient: 'cosmos1contract', coin: { denom: 'uatom', amount: 5n } },
      ],
      hasUnsummarizedMessages: true,
    })
  })

  it('reads an IBC transfer with its memo', () => {
    const review = getCosmosSignDataReview(
      directPayload({
        messages: [
          {
            typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
            value: MsgTransfer.encode(
              MsgTransfer.fromPartial({
                sourcePort: 'transfer',
                sourceChannel: 'channel-0',
                sender: 'cosmos1vault',
                receiver: 'osmo1receiver',
                token: { denom: 'uatom', amount: '7' },
                memo: 'forward',
              })
            ).finish(),
          },
        ],
      })
    )

    expect(review?.transfers).toEqual([
      {
        recipient: 'osmo1receiver',
        coin: { denom: 'uatom', amount: 7n },
        memo: 'forward',
      },
    ])
  })

  it('reads a delegation and accepts a vote without transfers', () => {
    const review = getCosmosSignDataReview(
      directPayload({
        messages: [
          {
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
            value: MsgDelegate.encode({
              delegatorAddress: 'cosmos1vault',
              validatorAddress: 'cosmosvaloper1validator',
              amount: { denom: 'uatom', amount: '3' },
            }).finish(),
          },
          {
            typeUrl: '/cosmos.gov.v1beta1.MsgVote',
            value: MsgVote.encode({
              proposalId: 1n,
              voter: 'cosmos1vault',
              option: 1,
            }).finish(),
          },
        ],
      })
    )

    expect(review).toMatchObject({
      transfers: [
        {
          recipient: 'cosmosvaloper1validator',
          coin: { denom: 'uatom', amount: 3n },
        },
      ],
      hasUnsummarizedMessages: false,
    })
  })

  it('reads THORChain sends and deposits', () => {
    const recipientBytes = new Uint8Array(20).fill(1)
    const review = getCosmosSignDataReview(
      directPayload({
        chain: Chain.THORChain,
        messages: [
          {
            typeUrl: '/types.MsgSend',
            value: TW.Cosmos.Proto.Message.THORChainSend.encode({
              fromAddress: new Uint8Array(20),
              toAddress: recipientBytes,
              amounts: [{ denom: 'rune', amount: '10' }],
            }).finish(),
          },
          {
            typeUrl: '/types.MsgDeposit',
            value: TW.Cosmos.Proto.Message.THORChainDeposit.encode({
              coins: [
                {
                  asset: { chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE' },
                  amount: '20',
                },
                {
                  asset: {
                    chain: 'BTC',
                    symbol: 'BTC',
                    ticker: 'BTC',
                    secured: true,
                  },
                  amount: '30',
                },
              ],
              memo: '=:ETH.ETH:0xabc',
              signer: new Uint8Array(20),
            }).finish(),
          },
        ],
      })
    )

    expect(review).toMatchObject({
      transfers: [
        {
          recipient: toBech32('thor', recipientBytes),
          coin: { denom: 'rune', amount: 10n },
        },
        { coin: { denom: 'rune', amount: 20n }, memo: '=:ETH.ETH:0xabc' },
        { coin: { denom: 'BTC-BTC', amount: 30n }, memo: '=:ETH.ETH:0xabc' },
      ],
      hasUnsummarizedMessages: false,
    })
  })

  it('reads amino messages and takes the memo from the payload', () => {
    const review = getCosmosSignDataReview(
      aminoPayload({
        msgs: [
          {
            type: 'cosmos-sdk/MsgSend',
            value: JSON.stringify({
              from_address: 'cosmos1vault',
              to_address: 'cosmos1first',
              amount: [{ denom: 'uatom', amount: '1' }],
            }),
          },
          {
            type: 'cosmos-sdk/MsgSend',
            value: JSON.stringify({
              from_address: 'cosmos1vault',
              to_address: 'cosmos1second',
              amount: [{ denom: 'uatom', amount: '2' }],
            }),
          },
        ],
        memo: 'amino memo',
      })
    )

    expect(review).toEqual({
      chain: Chain.Cosmos,
      transfers: [
        { recipient: 'cosmos1first', coin: { denom: 'uatom', amount: 1n } },
        { recipient: 'cosmos1second', coin: { denom: 'uatom', amount: 2n } },
      ],
      memo: 'amino memo',
      hasUnsummarizedMessages: false,
    })
  })

  it('flags a malformed or unknown amino message', () => {
    const review = getCosmosSignDataReview(
      aminoPayload({
        msgs: [
          {
            type: 'cosmos-sdk/MsgSend',
            value: JSON.stringify({ to_address: 'cosmos1first', amount: '1' }),
          },
          { type: 'custom/MsgAnything', value: '{}' },
        ],
      })
    )

    expect(review).toMatchObject({
      transfers: [],
      hasUnsummarizedMessages: true,
    })
  })

  it('ignores payloads without Cosmos sign data', () => {
    expect(
      getCosmosSignDataReview(
        create(KeysignPayloadSchema, {
          coin: create(CoinSchema, { chain: Chain.Cosmos }),
        })
      )
    ).toBeUndefined()

    expect(
      getCosmosSignDataReview(
        directPayload({
          chain: Chain.QBTC,
          messages: [send('qbtc1first', '1')],
        })
      )
    ).toBeUndefined()
  })
})
