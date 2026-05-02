import { PubKey as Secp256k1PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { Any } from 'cosmjs-types/google/protobuf/any'

const msgExecuteContractTypeUrl = '/cosmwasm.wasm.v1.MsgExecuteContract'
const secp256k1PubkeyTypeUrl = '/cosmos.crypto.secp256k1.PubKey'

type WasmExecuteContractInput = {
  sender: string
  contract: string
  /** UTF-8 of the JSON contract execute message. */
  msg: string
  funds: Array<{ denom: string; amount: string }>
}

/**
 * Encodes a `wasm/MsgExecuteContract` as a protobuf `Any`, ready to embed in
 * a `TxBody`. The proto's `msg` field is `bytes` — utf-8 of the JSON execute
 * message.
 */
export const encodeWasmExecuteAny = (input: WasmExecuteContractInput): Any =>
  Any.fromPartial({
    typeUrl: msgExecuteContractTypeUrl,
    value: MsgExecuteContract.encode(
      MsgExecuteContract.fromPartial({
        sender: input.sender,
        contract: input.contract,
        msg: new TextEncoder().encode(input.msg),
        funds: input.funds,
      })
    ).finish(),
  })

type EncodeTxBodyInput = {
  messages: Any[]
  memo?: string
  timeoutHeight?: bigint
}

/** Encodes a protobuf `TxBody` ready to feed into a `SIGN_MODE_DIRECT` SignDoc. */
export const encodeTxBody = (input: EncodeTxBodyInput): Uint8Array =>
  TxBody.encode(
    TxBody.fromPartial({
      messages: input.messages,
      memo: input.memo ?? '',
      timeoutHeight: input.timeoutHeight ?? 0n,
    })
  ).finish()

type EncodeAuthInfoInput = {
  /** Raw secp256k1 compressed public key bytes (33 bytes). */
  publicKey: Uint8Array
  sequence: bigint
  fee: {
    amount: Array<{ denom: string; amount: string }>
    gasLimit: bigint
    payer?: string
    granter?: string
  }
}

/**
 * Encodes a single-signer protobuf `AuthInfo` for `SIGN_MODE_DIRECT`. The
 * sequence here MUST match the on-chain sequence at broadcast time, otherwise
 * the chain rejects the tx with a sequence mismatch.
 */
export const encodeAuthInfo = (input: EncodeAuthInfoInput): Uint8Array =>
  AuthInfo.encode(
    AuthInfo.fromPartial({
      signerInfos: [
        {
          publicKey: Any.fromPartial({
            typeUrl: secp256k1PubkeyTypeUrl,
            value: Secp256k1PubKey.encode(
              Secp256k1PubKey.fromPartial({ key: input.publicKey })
            ).finish(),
          }),
          modeInfo: { single: { mode: SignMode.SIGN_MODE_DIRECT } },
          sequence: input.sequence,
        },
      ],
      fee: {
        amount: input.fee.amount,
        gasLimit: input.fee.gasLimit,
        payer: input.fee.payer ?? '',
        granter: input.fee.granter ?? '',
      },
    })
  ).finish()

type AssertWasmExecuteTxRawInput = {
  txRawBytes: Uint8Array
  expected: { sender: string; contract: string }
}

/**
 * Decodes a signed `TxRaw` and asserts that its body contains exactly one
 * `wasm/MsgExecuteContract` matching the expected `sender` and `contract`.
 *
 * Used as a post-sign safety check before broadcast — if any layer between
 * `encodeTxBody` and the wire format produces a different message type, this
 * throws and the broadcast is refused.
 */
export const assertWasmExecuteTxRaw = (
  input: AssertWasmExecuteTxRawInput
): void => {
  const txRaw = TxRaw.decode(input.txRawBytes)
  const txBody = TxBody.decode(txRaw.bodyBytes)

  if (txBody.messages.length !== 1) {
    throw new Error(
      `Station post: signed body has ${txBody.messages.length} messages, expected exactly 1. Refusing to broadcast.`
    )
  }

  const [msg] = txBody.messages
  if (msg.typeUrl !== msgExecuteContractTypeUrl) {
    throw new Error(
      `Station post: signed body has typeUrl "${msg.typeUrl}", expected "${msgExecuteContractTypeUrl}". Refusing to broadcast.`
    )
  }

  const decoded = MsgExecuteContract.decode(msg.value)
  if (decoded.sender !== input.expected.sender) {
    throw new Error(
      `Station post: signed body sender "${decoded.sender}" does not match expected "${input.expected.sender}". Refusing to broadcast.`
    )
  }
  if (decoded.contract !== input.expected.contract) {
    throw new Error(
      `Station post: signed body contract "${decoded.contract}" does not match expected "${input.expected.contract}". Refusing to broadcast.`
    )
  }
}
