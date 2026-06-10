import {
  type EncodeObject,
  encodePubkey,
  Registry,
} from '@cosmjs/proto-signing'
import { defaultRegistryTypes } from '@cosmjs/stargate'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

const msgDelegateTypeUrl = '/cosmos.staking.v1beta1.MsgDelegate'
const msgUndelegateTypeUrl = '/cosmos.staking.v1beta1.MsgUndelegate'
const msgBeginRedelegateTypeUrl = '/cosmos.staking.v1beta1.MsgBeginRedelegate'
const msgWithdrawDelegatorRewardTypeUrl =
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'

const registry = new Registry(defaultRegistryTypes)

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
 * `authInfoBytes` pair required by `KeysignPayload.signData.signDirect`. The
 * Vultisig Cosmos signing resolver consumes these bytes verbatim — it decodes
 * them only to extract the fee and memo for display, the actual sign-over is
 * the canonical SignDoc(bodyBytes, authInfoBytes, chainId, accountNumber).
 *
 * Sequence MUST match the sequence in `cosmosSpecific.sequence` (populated by
 * `getChainSpecific`) — the signing resolver passes both to WalletCore and the
 * chain rejects on mismatch.
 */
export const buildStakingSignDirectBytes = ({
  input,
  delegatorAddress,
  denom,
  memo,
  publicKey,
  sequence,
  feeAmount,
  gasLimit,
}: BuildStakingSignDirectBytesInput): {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
} => {
  const encoded = toEncodeObjects({ input, delegatorAddress, denom }).map(obj =>
    registry.encodeAsAny(obj)
  )

  const bodyBytes = TxBody.encode(
    TxBody.fromPartial({
      messages: encoded,
      memo: memo ?? '',
    })
  ).finish()

  const pubkeyAny = encodePubkey({
    type: 'tendermint/PubKeySecp256k1',
    value: Buffer.from(publicKey).toString('base64'),
  })

  const authInfoBytes = AuthInfo.encode(
    AuthInfo.fromPartial({
      signerInfos: [
        {
          publicKey: pubkeyAny,
          modeInfo: { single: { mode: SignMode.SIGN_MODE_DIRECT } },
          sequence,
        },
      ],
      fee: {
        amount: [feeAmount],
        gasLimit,
        payer: '',
        granter: '',
      },
    })
  ).finish()

  return { bodyBytes, authInfoBytes }
}
