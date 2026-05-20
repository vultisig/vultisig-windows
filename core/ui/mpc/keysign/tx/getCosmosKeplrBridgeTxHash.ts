import { createWasmAminoConverters, wasmTypes } from '@cosmjs/cosmwasm-stargate'
import { fromBase64, fromHex, toBase64 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import {
  encodePubkey,
  makeAuthInfoBytes,
  Registry,
} from '@cosmjs/proto-signing'
import {
  AminoTypes,
  createDefaultAminoConverters,
  defaultRegistryTypes,
} from '@cosmjs/stargate'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { sha256 } from 'viem'
import { z } from 'zod'

const registry = new Registry([...defaultRegistryTypes, ...wasmTypes])
const aminoTypes = new AminoTypes({
  ...createDefaultAminoConverters(),
  ...createWasmAminoConverters(),
})

const aminoCoinSchema = z.object({
  denom: z.string(),
  amount: z.string(),
})

const aminoStdTxSchema = z.object({
  msg: z.array(
    z.object({
      type: z.string(),
      value: z.record(z.string(), z.unknown()),
    })
  ),
  fee: z.object({
    amount: z.array(aminoCoinSchema),
    gas: z.string(),
    granter: z.string().optional(),
    payer: z.string().optional(),
  }),
  memo: z.string().optional().default(''),
  signatures: z
    .array(
      z.object({
        pub_key: z.object({ type: z.string(), value: z.string() }),
        signature: z.string(),
      })
    )
    .min(1, 'Amino JSON output is missing signatures'),
})

const aminoOutputSchema = z.object({ tx: aminoStdTxSchema })

const sha256UpperHex = (bytes: Uint8Array): string =>
  stripHexPrefix(sha256(bytes)).toUpperCase()

type EncodeTxRawHashInput = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
  signature: Uint8Array
}

const encodeTxRawHash = ({
  bodyBytes,
  authInfoBytes,
  signature,
}: EncodeTxRawHashInput): string => {
  const txRaw = TxRaw.fromPartial({
    bodyBytes,
    authInfoBytes,
    signatures: [signature],
  })
  return sha256UpperHex(TxRaw.encode(txRaw).finish())
}

type GetKeysignPayloadPubkeyBase64Input = {
  keysignPayload: KeysignPayload
  fallback: string
}

const getKeysignPayloadPubkeyBase64 = ({
  keysignPayload,
  fallback,
}: GetKeysignPayloadPubkeyBase64Input): string => {
  const hex = keysignPayload.coin?.hexPublicKey
  if (!hex) return fallback
  return toBase64(fromHex(stripHexPrefix(hex)))
}

type GetCosmosKeplrBridgeTxHashInput = {
  keysignPayload: KeysignPayload
  signedAminoJson: string | undefined
  signatureBytes: Uint8Array | undefined
}

/**
 * Compute the sha256 of the TxRaw a Keplr-bridge dApp will broadcast after a
 * `signAmino` / `signDirect` keysign — so the done screen polls the same hash
 * the dApp puts on-chain.
 *
 * WalletCore's amino output is the StdTx JSON, not the protobuf TxRaw the
 * dApp encodes via cosmjs. Hashing the amino JSON yields a hash that never
 * lands on-chain and `useTxStatusQuery` sits in `pending` forever. Rebuilding
 * the TxRaw via cosmjs's default registry + amino converters reproduces the
 * exact bytes a cosmos-kit / cosmjs dApp broadcasts.
 */
export const getCosmosKeplrBridgeTxHash = ({
  keysignPayload,
  signedAminoJson,
  signatureBytes,
}: GetCosmosKeplrBridgeTxHashInput): string => {
  const { signData } = keysignPayload

  if (signData.case === 'signDirect') {
    return encodeTxRawHash({
      bodyBytes: fromBase64(signData.value.bodyBytes),
      authInfoBytes: fromBase64(signData.value.authInfoBytes),
      signature: shouldBePresent(signatureBytes, 'cosmos signDirect signature'),
    })
  }

  if (signData.case !== 'signAmino') {
    throw new Error(
      `getCosmosKeplrBridgeTxHash: unsupported signData case ${signData.case}`
    )
  }

  const json = shouldBePresent(signedAminoJson, 'WalletCore amino JSON output')
  const stdTx = aminoOutputSchema.parse(JSON.parse(json)).tx
  const [stdSignature] = stdTx.signatures

  const cosmosSpecific = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'cosmosSpecific'
  )
  const pubkey = encodePubkey({
    type: 'tendermint/PubKeySecp256k1',
    value: getKeysignPayloadPubkeyBase64({
      keysignPayload,
      fallback: stdSignature.pub_key.value,
    }),
  })
  const sequence = Int53.fromString(
    cosmosSpecific.sequence.toString()
  ).toNumber()
  const gas = Int53.fromString(stdTx.fee.gas).toNumber()

  const bodyBytes = registry.encode({
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: {
      messages: stdTx.msg.map(msg =>
        aminoTypes.fromAmino({ type: msg.type, value: msg.value })
      ),
      memo: stdTx.memo,
    },
  })

  const authInfoBytes = makeAuthInfoBytes(
    [{ pubkey, sequence }],
    stdTx.fee.amount,
    gas,
    stdTx.fee.granter,
    stdTx.fee.payer,
    SignMode.SIGN_MODE_LEGACY_AMINO_JSON
  )

  const signature = signatureBytes ?? fromBase64(stdSignature.signature)

  return encodeTxRawHash({ bodyBytes, authInfoBytes, signature })
}
