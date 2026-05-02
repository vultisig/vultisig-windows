import { AminoMsg, StdFee } from '@cosmjs/amino'
import { Chain } from '@vultisig/core-chain/Chain'

/**
 * Maps a Terra Station proto-direct message `@type` URL to its amino `type`
 * string. Covers the message types we expect to see from `@terra-money/wallet-kit`
 * and `@terra-money/feather.js` for both Terra v2 (phoenix-1) and Terra Classic
 * (columbus-5).
 *
 * The amino `value` payload uses the same field names as the proto-direct value
 * for these types, so conversion is a key-swap + JSON.stringify of the
 * remaining fields.
 */
const protoTypeToAminoType: Record<string, string> = {
  '/cosmos.bank.v1beta1.MsgSend': 'cosmos-sdk/MsgSend',
  '/cosmos.staking.v1beta1.MsgDelegate': 'cosmos-sdk/MsgDelegate',
  '/cosmos.staking.v1beta1.MsgUndelegate': 'cosmos-sdk/MsgUndelegate',
  '/cosmos.staking.v1beta1.MsgBeginRedelegate': 'cosmos-sdk/MsgBeginRedelegate',
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward':
    'cosmos-sdk/MsgWithdrawDelegationReward',
  '/cosmos.gov.v1beta1.MsgVote': 'cosmos-sdk/MsgVote',
  '/ibc.applications.transfer.v1.MsgTransfer': 'cosmos-sdk/MsgTransfer',
  '/cosmwasm.wasm.v1.MsgExecuteContract': 'wasm/MsgExecuteContract',
  '/cosmwasm.wasm.v1.MsgInstantiateContract': 'wasm/MsgInstantiateContract',
  // Terra Classic-specific (legacy modules)
  '/terra.wasm.v1beta1.MsgExecuteContract': 'wasm/MsgExecuteContract',
  '/terra.wasm.v1beta1.MsgInstantiateContract': 'wasm/MsgInstantiateContract',
  '/terra.market.v1beta1.MsgSwap': 'market/MsgSwap',
  '/terra.market.v1beta1.MsgSwapSend': 'market/MsgSwapSend',
}

type FeatherMsgLike = { toData: (isClassic: boolean) => unknown }
type FeatherFeeLike = { toData: () => unknown }

const isFeatherMsg = (value: unknown): value is FeatherMsgLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as FeatherMsgLike).toData === 'function'

const isFeatherFee = (value: unknown): value is FeatherFeeLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as FeatherFeeLike).toData === 'function'

const isAminoShape = (value: unknown): value is AminoMsg =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).type === 'string' &&
  'value' in (value as Record<string, unknown>)

const isProtoShape = (
  value: unknown
): value is Record<string, unknown> & { '@type': string } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>)['@type'] === 'string'

const parseMaybeJson = (value: unknown): unknown =>
  typeof value === 'string' ? JSON.parse(value) : value

/**
 * Converts a single Terra Station tx message into an amino `AminoMsg`.
 *
 * Accepts proto-direct JSON (string or object with `@type`), pre-converted
 * amino shapes, and feather.js `Msg` class instances (detected via `.toData`).
 */
export const stationMsgToAmino = (rawMsg: unknown, chain: Chain): AminoMsg => {
  const isClassic = chain === Chain.TerraClassic
  const featherSource = isFeatherMsg(rawMsg) ? rawMsg.toData(isClassic) : rawMsg
  const parsed = parseMaybeJson(featherSource)

  if (isAminoShape(parsed)) {
    return parsed
  }

  if (!isProtoShape(parsed)) {
    throw new Error(
      `Station sign: unsupported message shape (expected proto @type, amino {type,value}, or feather.js Msg) — got ${JSON.stringify(parsed).slice(0, 120)}`
    )
  }

  const { '@type': typeUrl, ...value } = parsed
  const aminoType = protoTypeToAminoType[typeUrl]
  if (!aminoType) {
    throw new Error(
      `Station sign: unsupported proto message type "${typeUrl}". Add it to protoTypeToAminoType in stationProtoAmino.ts.`
    )
  }

  return { type: aminoType, value }
}

/**
 * Converts a Terra Station tx fee into an amino `StdFee`.
 *
 * Accepts proto-direct JSON (where the field is `gas_limit`), feather.js
 * `Fee` instances, and pre-built amino fees (where the field is `gas`).
 */
export const stationFeeToAmino = (rawFee: unknown): StdFee => {
  const featherSource = isFeatherFee(rawFee) ? rawFee.toData() : rawFee
  const parsed = parseMaybeJson(featherSource)

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(
      `Station sign: invalid fee shape — got ${JSON.stringify(parsed).slice(0, 120)}`
    )
  }

  const fee = parsed as {
    amount?: Array<{ denom: string; amount: string }>
    gas?: string | number
    gas_limit?: string | number
    payer?: string
    granter?: string
  }

  const gas = fee.gas ?? fee.gas_limit
  if (gas === undefined) {
    throw new Error('Station sign: fee missing `gas` / `gas_limit`')
  }

  return {
    amount: fee.amount ?? [],
    gas: String(gas),
    payer: fee.payer,
    granter: fee.granter,
  }
}
