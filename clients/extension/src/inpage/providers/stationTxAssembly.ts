import { AminoMsg, StdFee } from '@cosmjs/amino'
import { createWasmAminoConverters, wasmTypes } from '@cosmjs/cosmwasm-stargate'
import { encodePubkey, Registry } from '@cosmjs/proto-signing'
import {
  AminoTypes,
  createDefaultAminoConverters,
  defaultRegistryTypes,
} from '@cosmjs/stargate'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

// Registry / AminoTypes are stateless lookup tables — share one instance.
// Default types cover bank, staking, distribution, gov, ibc transfer,
// feegrant, vesting, authz, group. Wasm types add the cosmwasm execute /
// instantiate / migrate / store / admin messages.
const registry = new Registry([...defaultRegistryTypes, ...wasmTypes])
const aminoTypes = new AminoTypes({
  ...createDefaultAminoConverters(),
  ...createWasmAminoConverters(),
})

type BuildLegacyAminoTxRawInput = {
  /** Amino msgs as they appear in `StdSignDoc.msgs` (after signing). */
  aminoMsgs: AminoMsg[]
  /** The signed amino fee (unchanged from the StdSignDoc). */
  fee: StdFee
  /** Memo as it appeared in the signed StdSignDoc. */
  memo: string
  /** Account sequence the popup signed against (from StdSignDoc.sequence). */
  sequence: bigint
  /** Raw secp256k1 compressed public key bytes (33 bytes). */
  publicKey: Uint8Array
  /** Base64-encoded amino signature returned by the signer. */
  signature: string
}

/**
 * Assembles a protobuf `TxRaw` from an amino-signed payload using
 * `SIGN_MODE_LEGACY_AMINO_JSON` in the SignerInfo.
 *
 * The signature itself is over the amino StdSignDoc hash; the chain detects
 * the legacy mode in the AuthInfo and reconstructs the StdSignDoc from the
 * proto-encoded body to validate. So `aminoMsgs` here MUST be the same msgs
 * that were hashed by the signer — the caller is responsible for not
 * mutating them after signing.
 *
 * Generic by design: per-message-type encoding is delegated to cosmjs's
 * `AminoTypes` (default + wasm converters) and `Registry`. Adding support
 * for a new message type is a matter of registering it on the cosmjs side,
 * not editing this assembler.
 *
 * Throws if any amino msg is for a type the registry doesn't know — better
 * to fail closed than to silently encode an unknown message as something
 * else. The error originates from `aminoTypes.fromAmino`.
 */
export const buildLegacyAminoTxRawBytes = (
  input: BuildLegacyAminoTxRawInput
): Uint8Array => {
  const messages = input.aminoMsgs.map(amino => {
    const proto = aminoTypes.fromAmino(amino)
    return registry.encodeAsAny(proto)
  })

  const bodyBytes = TxBody.encode(
    TxBody.fromPartial({
      messages,
      memo: input.memo,
    })
  ).finish()

  const pubkeyAny = encodePubkey({
    type: 'tendermint/PubKeySecp256k1',
    value: Buffer.from(input.publicKey).toString('base64'),
  })

  const authInfoBytes = AuthInfo.encode(
    AuthInfo.fromPartial({
      signerInfos: [
        {
          publicKey: pubkeyAny,
          modeInfo: {
            single: { mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON },
          },
          sequence: input.sequence,
        },
      ],
      fee: {
        amount: input.fee.amount.map(c => ({
          denom: c.denom,
          amount: c.amount,
        })),
        gasLimit: BigInt(input.fee.gas),
        payer: input.fee.payer ?? '',
        granter: input.fee.granter ?? '',
      },
    })
  ).finish()

  return TxRaw.encode(
    TxRaw.fromPartial({
      bodyBytes,
      authInfoBytes,
      signatures: [Buffer.from(input.signature, 'base64')],
    })
  ).finish()
}

type AssertAminoMsgsMatchInput = {
  expected: AminoMsg[]
  actual: AminoMsg[]
}

/**
 * Recursively serializes a value with object keys sorted alphabetically at
 * every nesting level — the canonical form used by amino StdSignDoc hashing.
 * Two msgs that differ only in key order will produce identical strings.
 */
const canonicalJson = (value: unknown): string => {
  const sortReplacer = (_key: string, val: unknown): unknown => {
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      !(val instanceof Uint8Array)
    ) {
      const obj = val as Record<string, unknown>
      return Object.keys(obj)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = obj[k]
          return acc
        }, {})
    }
    return val
  }
  return JSON.stringify(value, sortReplacer)
}

/**
 * Asserts the amino msgs returned by the signer (`output.json` → `tx.msg`)
 * match the msgs we passed into the StdSignDoc. Catches semantic rewrites
 * (added / removed / changed fields) without false-positiving on key order
 * — TW canonicalizes by sorting keys recursively when it emits the signed
 * StdTx, so a strict-string comparison would fail on every msg.
 *
 * Comparison is canonical deep equality (sorted keys at every nesting
 * level). Array order is preserved (matters for `msgs[]`, `funds[]`,
 * Astroport's `operations[]` etc.).
 */
export const assertAminoMsgsMatch = (
  input: AssertAminoMsgsMatchInput
): void => {
  if (input.expected.length !== input.actual.length) {
    throw new Error(
      `Station post: signed body has ${input.actual.length} messages, expected ${input.expected.length}. Refusing to broadcast.`
    )
  }
  for (let i = 0; i < input.expected.length; i++) {
    const exp = canonicalJson(input.expected[i])
    const act = canonicalJson(input.actual[i])
    if (exp !== act) {
      throw new Error(
        `Station post: signed message[${i}] does not match the request. Refusing to broadcast.\nExpected: ${exp}\nActual:   ${act}`
      )
    }
  }
}
