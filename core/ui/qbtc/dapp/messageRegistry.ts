import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import {
  MsgDeposit as MsgDepositV1,
  MsgVote as MsgVoteV1,
  MsgVoteWeighted as MsgVoteWeightedV1,
} from 'cosmjs-types/cosmos/gov/v1/tx'
import {
  MsgDeposit as MsgDepositV1Beta1,
  MsgVote as MsgVoteV1Beta1,
  MsgVoteWeighted as MsgVoteWeightedV1Beta1,
} from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

type CosmosMessageProtoEncoder = (value: Record<string, unknown>) => Uint8Array

/**
 * Shape exposed by every message constant in `cosmjs-types`. Generics are
 * collapsed to `any` because each constant carries a different proto shape;
 * the per-type safety lives at the dApp boundary where `fromPartial` accepts
 * the JSON value as-is.
 */
type CosmjsMessageCodec<T> = {
  fromPartial: (value: any) => T
  encode: (message: T) => { finish: () => Uint8Array }
}

const fromCodec =
  <T>(codec: CosmjsMessageCodec<T>): CosmosMessageProtoEncoder =>
  value =>
    codec.encode(codec.fromPartial(value)).finish()

/**
 * TypeUrls accepted by `vultisig.qbtc.request({ method: 'sign_and_broadcast' })`.
 * Add new entries here as more Cosmos SDK message types are wired up by dApps.
 */
const qbtcMessageEncoders: Record<string, CosmosMessageProtoEncoder> = {
  '/cosmos.bank.v1beta1.MsgSend': fromCodec(MsgSend),
  '/cosmos.gov.v1.MsgVote': fromCodec(MsgVoteV1),
  '/cosmos.gov.v1.MsgVoteWeighted': fromCodec(MsgVoteWeightedV1),
  '/cosmos.gov.v1.MsgDeposit': fromCodec(MsgDepositV1),
  '/cosmos.gov.v1beta1.MsgVote': fromCodec(MsgVoteV1Beta1),
  '/cosmos.gov.v1beta1.MsgVoteWeighted': fromCodec(MsgVoteWeightedV1Beta1),
  '/cosmos.gov.v1beta1.MsgDeposit': fromCodec(MsgDepositV1Beta1),
  '/cosmos.staking.v1beta1.MsgDelegate': fromCodec(MsgDelegate),
  '/cosmos.staking.v1beta1.MsgUndelegate': fromCodec(MsgUndelegate),
  '/cosmos.staking.v1beta1.MsgBeginRedelegate': fromCodec(MsgBeginRedelegate),
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': fromCodec(
    MsgWithdrawDelegatorReward
  ),
  '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission': fromCodec(
    MsgWithdrawValidatorCommission
  ),
  '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress': fromCodec(
    MsgSetWithdrawAddress
  ),
  '/cosmos.distribution.v1beta1.MsgFundCommunityPool':
    fromCodec(MsgFundCommunityPool),
  '/ibc.applications.transfer.v1.MsgTransfer': fromCodec(MsgTransfer),
}

export const getQbtcMessageEncoder = (
  typeUrl: string
): CosmosMessageProtoEncoder | undefined => qbtcMessageEncoders[typeUrl]
