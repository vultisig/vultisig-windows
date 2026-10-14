import {
  type EncodeObject,
  encodePubkey,
  Registry,
} from '@cosmjs/proto-signing'
import { defaultRegistryTypes } from '@cosmjs/stargate'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

const registry = new Registry(defaultRegistryTypes)

type BuildCosmosSignDirectBytesInput = {
  messages: EncodeObject[]
  memo?: string
  /** Compressed secp256k1 public key (33 bytes). */
  publicKey: Uint8Array
  sequence: bigint
  feeAmount: { denom: string; amount: string }
  gasLimit: bigint
}

/**
 * Encodes Cosmos SDK messages into the proto-direct `bodyBytes` /
 * `authInfoBytes` pair required by `KeysignPayload.signData.signDirect`. Every
 * signer — the Vultisig Cosmos signing resolver, iOS and Android — consumes
 * these bytes verbatim; the sign-over is the canonical SignDoc(bodyBytes,
 * authInfoBytes, chainId, accountNumber).
 *
 * Sequence MUST match the sequence in `cosmosSpecific.sequence` (populated by
 * `getChainSpecific`) — the signing resolver passes both to WalletCore and the
 * chain rejects on mismatch.
 */
export const buildCosmosSignDirectBytes = ({
  messages,
  memo,
  publicKey,
  sequence,
  feeAmount,
  gasLimit,
}: BuildCosmosSignDirectBytesInput): {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
} => {
  const bodyBytes = TxBody.encode(
    TxBody.fromPartial({
      messages: messages.map(message => registry.encodeAsAny(message)),
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
