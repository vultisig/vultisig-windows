import { create } from '@bufbuild/protobuf'
import { unknownTxHash } from '@core/ui/chain/tx/unknownTxHash'
import { fromHex, toBase64, toHex } from '@cosmjs/encoding'
import { Registry } from '@cosmjs/proto-signing'
import { CosmosSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignAminoSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { describe, expect, it } from 'vitest'

import { getCosmosDAppTxHash } from '../getCosmosDAppTxHash'
import { getCosmosKeplrBridgeTxHash } from '../getCosmosKeplrBridgeTxHash'
import { osmosisRegistryTypes } from './osmosisAminoMessages'
import { osmosisMainnetTxs } from './osmosisMainnetTxs.fixture'

type OsmosisMainnetTx = (typeof osmosisMainnetTxs)[number]
type AminoMsg = { type: string; value: Record<string, unknown> }

const registry = new Registry(osmosisRegistryTypes)

type EncodeToHexInput = {
  typeUrl: string
  value: Record<string, unknown>
}

const encodeToHex = ({ typeUrl, value }: EncodeToHexInput) =>
  toHex(registry.encode({ typeUrl, value }))

const undelegateTypeUrl =
  '/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet'
const createPositionTypeUrl =
  '/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition'
const collectIncentivesTypeUrl =
  '/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives'
const removeAuthenticatorTypeUrl =
  '/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator'
const setValsetTypeUrl =
  '/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference'
const withdrawPositionTypeUrl =
  '/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition'
const swapInTypeUrl = '/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn'

type GetHashInputInput = {
  tx: OsmosisMainnetTx
  msgs?: AminoMsg[]
  timeoutHeight?: bigint
}

const getHashInput = ({ tx, msgs, timeoutHeight }: GetHashInputInput) => ({
  keysignPayload: create(KeysignPayloadSchema, {
    skipBroadcast: true,
    coin: create(CoinSchema, { hexPublicKey: tx.hexPublicKey }),
    blockchainSpecific: {
      case: 'cosmosSpecific',
      value: create(CosmosSpecificSchema, { sequence: BigInt(tx.sequence) }),
    },
    signData: {
      case: 'signAmino',
      value: create(SignAminoSchema, {
        timeoutHeight: timeoutHeight ?? BigInt(tx.timeoutHeight),
      }),
    },
  }),
  signedAminoJson: JSON.stringify({
    tx: {
      msg: msgs ?? tx.msgs,
      fee: tx.fee,
      memo: tx.memo,
      signatures: [
        {
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: toBase64(fromHex(tx.hexPublicKey)),
          },
          signature: tx.signature,
        },
      ],
    },
  }),
  signatureBytes: undefined,
})

describe('Osmosis amino hash rebuild', () => {
  it.each(osmosisMainnetTxs.map(tx => [tx.typeUrl, tx] as const))(
    'rebuilds the hash the chain recorded for %s',
    (_typeUrl, tx) => {
      expect(getCosmosKeplrBridgeTxHash(getHashInput({ tx }))).toBe(tx.txHash)
    }
  )

  it('has a mainnet transaction for every message but the unused undelegate', () => {
    const covered = new Set(osmosisMainnetTxs.map(({ typeUrl }) => typeUrl))
    const uncovered = osmosisRegistryTypes
      .map(([typeUrl]) => typeUrl)
      .filter(typeUrl => !covered.has(typeUrl))

    expect(uncovered).toEqual([undelegateTypeUrl])
  })

  it('needs the timeout height to match what the dApp broadcast', () => {
    const [tx] = osmosisMainnetTxs

    expect(
      getCosmosKeplrBridgeTxHash(getHashInput({ tx, timeoutHeight: 0n }))
    ).not.toBe(tx.txHash)
  })

  it.each([
    [
      'an unknown field',
      swapInTypeUrl,
      { sender: 'osmo1a', some_new_field: '1' },
    ],
    [
      'a decimal-form LegacyDec the chain would not have signed',
      withdrawPositionTypeUrl,
      { sender: 'osmo1a', liquidity_amount: '1.500000000000000000' },
    ],
  ])('tracks no hash for a message with %s', (_label, typeUrl, value) => {
    const [tx] = osmosisMainnetTxs
    const { msgs: matchingMsgs } = shouldBePresent(
      osmosisMainnetTxs.find(candidate => candidate.typeUrl === typeUrl)
    )

    expect(
      getCosmosDAppTxHash(
        getHashInput({ tx, msgs: [{ type: matchingMsgs[0].type, value }] })
      )
    ).toBe(unknownTxHash)
  })
})

describe('Osmosis protobuf encoding', () => {
  it('writes the undelegate coin at field 3', () => {
    expect(
      encodeToHex({
        typeUrl: undelegateTypeUrl,
        value: { delegator: 'osmo1a', coin: { denom: 'uosmo', amount: '5' } },
      })
    ).toBe('0a066f736d6f31611a0a0a05756f736d6f120135')
  })

  it.each([
    ['empty', { position_ids: [], sender: 'a' }],
    ['absent', { sender: 'a' }],
  ])('writes the packed field for %s position ids', (_label, value) => {
    expect(encodeToHex({ typeUrl: collectIncentivesTypeUrl, value })).toBe(
      '0a00120161'
    )
  })

  it('packs position ids', () => {
    expect(
      encodeToHex({
        typeUrl: collectIncentivesTypeUrl,
        value: { position_ids: ['1', '300'] },
      })
    ).toBe('0a03' + '01ac02')
  })

  it('keeps uint64 values above 2^53', () => {
    expect(
      encodeToHex({
        typeUrl: removeAuthenticatorTypeUrl,
        value: { sender: 'a', id: '18446744073709551615' },
      })
    ).toBe('0a016110ffffffffffffffffff01')
  })

  it('writes a negative tick as a ten-byte varint', () => {
    expect(
      encodeToHex({
        typeUrl: createPositionTypeUrl,
        value: { lower_tick: '-1' },
      })
    ).toBe('18ffffffffffffffffff01')
  })

  it('omits zero values', () => {
    expect(
      encodeToHex({
        typeUrl: createPositionTypeUrl,
        value: {
          pool_id: '0',
          sender: '',
          lower_tick: '0',
          tokens_provided: [],
          token_min_amount0: null,
        },
      })
    ).toBe('')
  })

  it('writes a LegacyDec as the atomics it was signed with', () => {
    expect(
      encodeToHex({
        typeUrl: setValsetTypeUrl,
        value: { preferences: [{ weight: '1000' }] },
      })
    ).toBe('1206' + '1204' + '31303030')
  })

  it.each([
    ['an unknown nested field', swapInTypeUrl, { routes: [{ pool: '1' }] }],
    [
      'a uint64 out of range',
      removeAuthenticatorTypeUrl,
      { id: '18446744073709551616' },
    ],
    ['a negative uint64', removeAuthenticatorTypeUrl, { id: '-1' }],
    ['a numeric uint64', removeAuthenticatorTypeUrl, { id: 1 }],
    [
      'an int64 out of range',
      createPositionTypeUrl,
      { lower_tick: '9223372036854775808' },
    ],
    ['a non-string', swapInTypeUrl, { sender: 1 }],
  ])('refuses %s', (_label, typeUrl, value) => {
    expect(() => encodeToHex({ typeUrl, value })).toThrow()
  })
})
