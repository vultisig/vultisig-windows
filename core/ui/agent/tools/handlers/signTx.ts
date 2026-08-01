import { fromBinary } from '@bufbuild/protobuf'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { decodeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import { broadcastTx } from '@vultisig/core-chain/tx/broadcast'
import { getTxHash } from '@vultisig/core-chain/tx/hash'
import type { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { getEncodedSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { compileTx } from '@vultisig/core-mpc/tx/compile/compileTx'
import { getPreSigningHashes } from '@vultisig/core-mpc/tx/preSigningHashes'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { z } from 'zod'

import { fastVaultKeysign } from '../shared/fastVaultKeysign'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'
import { pollTxReceipt } from './txReceiptPolling'

const signTxInputSchema = z.object({
  keysign_payload: z.string(),
  conversation_id: z.string().optional(),
  tx_type: z.string().optional(),
})

export const handleSignTx: ToolHandler = async (input, context) => {
  const vault = context.vault
  if (!vault) {
    throw new Error('Vault metadata required for signing')
  }

  const validated = signTxInputSchema.parse(input)
  const keysignPayloadB64 = validated.keysign_payload
  const conversationId = validated.conversation_id
  const txType = validated.tx_type

  const payloadBytes = Uint8Array.from(atob(keysignPayloadB64), c =>
    c.charCodeAt(0)
  )
  const keysignPayload = fromBinary(KeysignPayloadSchema, payloadBytes)

  const chain = getKeysignChain(keysignPayload)
  const algorithm = getSignatureAlgorithm(chain)

  const { walletCore, vault: walletVault } = getWalletContext()

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: walletVault.hexChainCode,
    publicKeys: walletVault.publicKeys,
    chainPublicKeys: walletVault.chainPublicKeys,
  })

  const coinType = getCoinType({ walletCore, chain })
  const derivePath = walletCore.CoinTypeExt.derivationPath(coinType)

  const encodedInputs = await getEncodedSigningInputs({
    keysignPayload,
    walletCore,
    publicKey,
  })

  const txResults: { label: string; tx_hash: string }[] = []

  const emitEvent = context.emitEvent

  for (let i = 0; i < encodedInputs.length; i++) {
    const txInputData = encodedInputs[i]

    const label =
      encodedInputs.length > 1 && i === 0
        ? 'approval'
        : (txType ?? (encodedInputs.length === 1 ? 'transfer' : 'swap'))

    const hashes = getPreSigningHashes({
      walletCore,
      txInputData,
      chain,
      keysignPayload,
    })

    const signatures: Record<string, KeysignSignature> = {}
    for (const hash of hashes) {
      const hexHash = Buffer.from(hash).toString('hex')
      const sig = await fastVaultKeysign({
        vault,
        messageHash: hexHash,
        derivePath,
        signatureAlgorithm: algorithm,
        chain,
      })
      signatures[hexHash] = sig
    }

    const compiled = compileTx({
      publicKey,
      txInputData,
      signatures,
      chain,
      walletCore,
      keysignPayload,
    })

    const signingOutput = decodeSigningOutput(chain, compiled)
    const txHash = await getTxHash({ chain, tx: signingOutput })

    await broadcastTx({ chain, tx: signingOutput })

    if (conversationId && emitEvent) {
      void pollTxReceipt({ chain, txHash, conversationId, label, emitEvent })
    }

    txResults.push({ label, tx_hash: txHash })
  }

  const result: Record<string, unknown> = {
    chain,
    transactions: txResults,
  }
  if (txResults.length > 0) {
    result.tx_hash = txResults[txResults.length - 1].tx_hash
  }

  return { data: result }
}
