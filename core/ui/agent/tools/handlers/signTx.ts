import { fromBinary } from '@bufbuild/protobuf'
import { EvmChain } from '@core/chain/Chain'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getCoinType } from '@core/chain/coin/coinType'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { decodeSigningOutput } from '@core/chain/tw/signingOutput'
import { broadcastTx } from '@core/chain/tx/broadcast'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { getTxHash } from '@core/chain/tx/hash'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import type { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { fastVaultKeysign } from '../shared/fastVaultKeysign'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'

export const handleSignTx: ToolHandler = async (input, context) => {
  const vault = context.vault
  if (!vault) {
    throw new Error('Vault metadata required for signing')
  }

  const keysignPayloadB64 = input.keysign_payload as string
  if (!keysignPayloadB64) {
    throw new Error('keysign_payload is required')
  }

  const conversationId = input.conversation_id as string | undefined

  const payloadBytes = Uint8Array.from(atob(keysignPayloadB64), c =>
    c.charCodeAt(0)
  )
  const keysignPayload = fromBinary(KeysignPayloadSchema, payloadBytes)

  const chain = getKeysignChain(keysignPayload)
  const chainKind = getChainKind(chain)
  const algorithm = signatureAlgorithms[chainKind]

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

  const encodedInputs = getEncodedSigningInputs({
    keysignPayload,
    walletCore,
    publicKey,
  })

  const txResults: { label: string; tx_hash: string }[] = []

  const emitEvent = context.emitEvent

  for (let i = 0; i < encodedInputs.length; i++) {
    const txInputData = encodedInputs[i]

    const label = encodedInputs.length > 1 && i === 0 ? 'approval' : `swap`

    const hashes = getPreSigningHashes({ walletCore, txInputData, chain })

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
    })

    const signingOutput = decodeSigningOutput(chain, compiled)
    const txHash = await getTxHash({ chain, tx: signingOutput })

    await broadcastTx({ chain, tx: signingOutput })

    if (isChainOfKind(chain, 'evm') && conversationId && emitEvent) {
      pollEvmReceipt(
        chain as EvmChain,
        txHash,
        conversationId,
        label,
        emitEvent
      )
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

function pollEvmReceipt(
  chain: EvmChain,
  txHash: string,
  conversationId: string,
  label: string,
  emitEvent: (event: string, data: Record<string, unknown>) => void
) {
  const client = getEvmClient(chain)
  const hash = txHash as `0x${string}`

  emitEvent('tx_status', {
    conversationId,
    txHash,
    chain,
    status: 'pending',
    label,
  })

  client
    .waitForTransactionReceipt({ hash, timeout: 180_000 })
    .then(receipt => {
      const status = receipt.status === 'success' ? 'confirmed' : 'failed'
      emitEvent('tx_status', {
        conversationId,
        txHash,
        chain,
        status,
        label,
      })
    })
    .catch(() => {})
}
