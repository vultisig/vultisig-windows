import { GeneratedType } from '@cosmjs/proto-signing'
import { AminoConverters } from '@cosmjs/stargate'

import { createOsmosisProtoType, OsmosisProtoField } from './osmosisAminoCodec'

// Hand-written instead of pulling in `osmojs` (see osmosisValsetprefDecoders.ts).
// The schemas mirror osmosis-labs/osmosis `proto/osmosis/**/tx.proto`, and the
// tests hold them to real mainnet transactions. Field order is wire order.

type OsmosisAminoMessage = {
  typeUrl: string
  aminoType: string
  fields: OsmosisProtoField[]
}

const coin: OsmosisProtoField[] = [
  { key: 'denom', fieldNo: 1, kind: 'string' },
  { key: 'amount', fieldNo: 2, kind: 'string' },
]

const swapAmountInRoute: OsmosisProtoField[] = [
  { key: 'pool_id', fieldNo: 1, kind: 'uint64' },
  { key: 'token_out_denom', fieldNo: 2, kind: 'string' },
]

const swapAmountOutRoute: OsmosisProtoField[] = [
  { key: 'pool_id', fieldNo: 1, kind: 'uint64' },
  { key: 'token_in_denom', fieldNo: 2, kind: 'string' },
]

const positionIdsAndSender: OsmosisProtoField[] = [
  { key: 'position_ids', fieldNo: 1, kind: 'packedUint64' },
  { key: 'sender', fieldNo: 2, kind: 'string' },
]

const delegatorAndCoinAt = (coinFieldNo: number): OsmosisProtoField[] => [
  { key: 'delegator', fieldNo: 1, kind: 'string' },
  { key: 'coin', fieldNo: coinFieldNo, kind: 'message', fields: coin },
]

const osmosisAminoMessages: OsmosisAminoMessage[] = [
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn',
    aminoType: 'osmosis/poolmanager/swap-exact-amount-in',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      {
        key: 'routes',
        fieldNo: 2,
        kind: 'repeatedMessage',
        fields: swapAmountInRoute,
      },
      { key: 'token_in', fieldNo: 3, kind: 'message', fields: coin },
      { key: 'token_out_min_amount', fieldNo: 4, kind: 'string' },
    ],
  },
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut',
    aminoType: 'osmosis/poolmanager/swap-exact-amount-out',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      {
        key: 'routes',
        fieldNo: 2,
        kind: 'repeatedMessage',
        fields: swapAmountOutRoute,
      },
      { key: 'token_in_max_amount', fieldNo: 3, kind: 'string' },
      { key: 'token_out', fieldNo: 4, kind: 'message', fields: coin },
    ],
  },
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn',
    aminoType: 'osmosis/poolmanager/split-amount-in',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      {
        key: 'routes',
        fieldNo: 2,
        kind: 'repeatedMessage',
        fields: [
          {
            key: 'pools',
            fieldNo: 1,
            kind: 'repeatedMessage',
            fields: swapAmountInRoute,
          },
          { key: 'token_in_amount', fieldNo: 2, kind: 'string' },
        ],
      },
      { key: 'token_in_denom', fieldNo: 3, kind: 'string' },
      { key: 'token_out_min_amount', fieldNo: 4, kind: 'string' },
    ],
  },
  {
    typeUrl: '/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut',
    aminoType: 'osmosis/poolmanager/split-amount-out',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      {
        key: 'routes',
        fieldNo: 2,
        kind: 'repeatedMessage',
        fields: [
          {
            key: 'pools',
            fieldNo: 1,
            kind: 'repeatedMessage',
            fields: swapAmountOutRoute,
          },
          { key: 'token_out_amount', fieldNo: 2, kind: 'string' },
        ],
      },
      { key: 'token_out_denom', fieldNo: 3, kind: 'string' },
      { key: 'token_in_max_amount', fieldNo: 4, kind: 'string' },
    ],
  },
  {
    typeUrl: '/osmosis.gamm.v1beta1.MsgJoinPool',
    aminoType: 'osmosis/gamm/join-pool',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      { key: 'pool_id', fieldNo: 2, kind: 'uint64' },
      { key: 'share_out_amount', fieldNo: 3, kind: 'string' },
      {
        key: 'token_in_maxs',
        fieldNo: 4,
        kind: 'repeatedMessage',
        fields: coin,
      },
    ],
  },
  {
    typeUrl: '/osmosis.gamm.v1beta1.MsgExitPool',
    aminoType: 'osmosis/gamm/exit-pool',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      { key: 'pool_id', fieldNo: 2, kind: 'uint64' },
      { key: 'share_in_amount', fieldNo: 3, kind: 'string' },
      {
        key: 'token_out_mins',
        fieldNo: 4,
        kind: 'repeatedMessage',
        fields: coin,
      },
    ],
  },
  {
    typeUrl: '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
    aminoType: 'osmosis/gamm/join-swap-extern-amount-in',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      { key: 'pool_id', fieldNo: 2, kind: 'uint64' },
      { key: 'token_in', fieldNo: 3, kind: 'message', fields: coin },
      { key: 'share_out_min_amount', fieldNo: 4, kind: 'string' },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition',
    aminoType: 'osmosis/cl-create-position',
    fields: [
      { key: 'pool_id', fieldNo: 1, kind: 'uint64' },
      { key: 'sender', fieldNo: 2, kind: 'string' },
      { key: 'lower_tick', fieldNo: 3, kind: 'int64' },
      { key: 'upper_tick', fieldNo: 4, kind: 'int64' },
      {
        key: 'tokens_provided',
        fieldNo: 5,
        kind: 'repeatedMessage',
        fields: coin,
      },
      { key: 'token_min_amount0', fieldNo: 6, kind: 'string' },
      { key: 'token_min_amount1', fieldNo: 7, kind: 'string' },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition',
    aminoType: 'osmosis/cl-add-to-position',
    fields: [
      { key: 'position_id', fieldNo: 1, kind: 'uint64' },
      { key: 'sender', fieldNo: 2, kind: 'string' },
      { key: 'amount0', fieldNo: 3, kind: 'string' },
      { key: 'amount1', fieldNo: 4, kind: 'string' },
      { key: 'token_min_amount0', fieldNo: 5, kind: 'string' },
      { key: 'token_min_amount1', fieldNo: 6, kind: 'string' },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition',
    aminoType: 'osmosis/cl-withdraw-position',
    fields: [
      { key: 'position_id', fieldNo: 1, kind: 'uint64' },
      { key: 'sender', fieldNo: 2, kind: 'string' },
      { key: 'liquidity_amount', fieldNo: 3, kind: 'legacyDec' },
    ],
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards',
    aminoType: 'osmosis/cl-col-sp-rewards',
    fields: positionIdsAndSender,
  },
  {
    typeUrl: '/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives',
    aminoType: 'osmosis/cl-collect-incentives',
    fields: positionIdsAndSender,
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference',
    aminoType: 'osmosis/MsgSetValidatorSetPreference',
    fields: [
      { key: 'delegator', fieldNo: 1, kind: 'string' },
      {
        key: 'preferences',
        fieldNo: 2,
        kind: 'repeatedMessage',
        fields: [
          { key: 'val_oper_address', fieldNo: 1, kind: 'string' },
          { key: 'weight', fieldNo: 2, kind: 'legacyDec' },
        ],
      },
    ],
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet',
    aminoType: 'osmosis/MsgDelegateToValidatorSet',
    fields: delegatorAndCoinAt(2),
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet',
    aminoType: 'osmosis/MsgUndelegateFromValidatorSet',
    fields: delegatorAndCoinAt(3),
  },
  {
    typeUrl:
      '/osmosis.valsetpref.v1beta1.MsgUndelegateFromRebalancedValidatorSet',
    aminoType: 'osmosis/MsgUndelegateFromRebalValset',
    fields: delegatorAndCoinAt(2),
  },
  {
    typeUrl: '/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards',
    aminoType: 'osmosis/MsgWithdrawDelegationRewards',
    fields: [{ key: 'delegator', fieldNo: 1, kind: 'string' }],
  },
  {
    typeUrl: '/osmosis.smartaccount.v1beta1.MsgAddAuthenticator',
    aminoType: 'osmosis/smartaccount/add-authenticator',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      { key: 'authenticator_type', fieldNo: 2, kind: 'string' },
      { key: 'data', fieldNo: 3, kind: 'bytes' },
    ],
  },
  {
    typeUrl: '/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator',
    aminoType: 'osmosis/smartaccount/remove-authenticator',
    fields: [
      { key: 'sender', fieldNo: 1, kind: 'string' },
      { key: 'id', fieldNo: 2, kind: 'uint64' },
    ],
  },
]

/** Protobuf encoders for the Osmosis messages a dApp can have amino-signed. */
export const osmosisRegistryTypes: [string, GeneratedType][] =
  osmosisAminoMessages.map(({ typeUrl, fields }) => [
    typeUrl,
    createOsmosisProtoType(fields),
  ])

/**
 * Amino converters for the same messages. The conversions are identity because
 * the encoders in `osmosisRegistryTypes` read the amino JSON directly.
 */
export const osmosisAminoConverters: AminoConverters = Object.fromEntries(
  osmosisAminoMessages.map(({ typeUrl, aminoType }) => [
    typeUrl,
    {
      aminoType,
      toAmino: (value: unknown) => value,
      fromAmino: (value: unknown) => value,
    },
  ])
)
