import { type EncodeObject } from '@cosmjs/proto-signing'

import { buildCosmosSignDirectBytes } from '../cosmosSignDirect/buildCosmosSignDirectBytes'

const msgDelegateTypeUrl = '/cosmos.staking.v1beta1.MsgDelegate'
const msgUndelegateTypeUrl = '/cosmos.staking.v1beta1.MsgUndelegate'
const msgBeginRedelegateTypeUrl = '/cosmos.staking.v1beta1.MsgBeginRedelegate'
const msgWithdrawDelegatorRewardTypeUrl =
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'

export type CosmosStakingInput =
  | {
      action: 'delegate'
      validatorAddress: string
      amount: string
    }
  | {
      action: 'undelegate'
      validatorAddress: string
      amount: string
    }
  | {
      action: 'redelegate'
      srcValidatorAddress: string
      dstValidatorAddress: string
      amount: string
    }
  | {
      action: 'claim_rewards'
      validatorAddresses: string[]
    }

type ToEncodeObjectsInput = {
  input: CosmosStakingInput
  delegatorAddress: string
  denom: string
}

/**
 * Maps a {@link CosmosStakingInput} to the cosmos-sdk message objects
 * (`{ typeUrl, value }`) for the action. Exported so chains that build their
 * own SignDoc bytes (e.g. QBTC's manual MLDSA protobuf path) can reuse the
 * exact same message shapes instead of duplicating the typeUrl/value mapping.
 */
export const toEncodeObjects = ({
  input,
  delegatorAddress,
  denom,
}: ToEncodeObjectsInput): EncodeObject[] => {
  if (input.action === 'delegate') {
    return [
      {
        typeUrl: msgDelegateTypeUrl,
        value: {
          delegatorAddress,
          validatorAddress: input.validatorAddress,
          amount: { denom, amount: input.amount },
        },
      },
    ]
  }
  if (input.action === 'undelegate') {
    return [
      {
        typeUrl: msgUndelegateTypeUrl,
        value: {
          delegatorAddress,
          validatorAddress: input.validatorAddress,
          amount: { denom, amount: input.amount },
        },
      },
    ]
  }
  if (input.action === 'redelegate') {
    return [
      {
        typeUrl: msgBeginRedelegateTypeUrl,
        value: {
          delegatorAddress,
          validatorSrcAddress: input.srcValidatorAddress,
          validatorDstAddress: input.dstValidatorAddress,
          amount: { denom, amount: input.amount },
        },
      },
    ]
  }
  // claim_rewards: emit one MsgWithdrawDelegatorReward per validator. The
  // bulk-claim case carries multiple validators in a single multi-msg tx, so
  // the user signs one tx that withdraws from every active delegation.
  return input.validatorAddresses.map(validatorAddress => ({
    typeUrl: msgWithdrawDelegatorRewardTypeUrl,
    value: {
      delegatorAddress,
      validatorAddress,
    },
  }))
}

type BuildStakingSignDirectBytesInput = {
  input: CosmosStakingInput
  delegatorAddress: string
  denom: string
  memo?: string
  /** Compressed secp256k1 public key (33 bytes). */
  publicKey: Uint8Array
  sequence: bigint
  feeAmount: { denom: string; amount: string }
  gasLimit: bigint
}

/**
 * Encodes a Cosmos SDK staking transaction into the proto-direct `bodyBytes` /
 * `authInfoBytes` pair required by `KeysignPayload.signData.signDirect`. See
 * {@link buildCosmosSignDirectBytes} for how signers consume them.
 */
export const buildStakingSignDirectBytes = ({
  input,
  delegatorAddress,
  denom,
  ...rest
}: BuildStakingSignDirectBytesInput): {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
} =>
  buildCosmosSignDirectBytes({
    messages: toEncodeObjects({ input, delegatorAddress, denom }),
    ...rest,
  })
