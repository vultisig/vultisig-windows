import { fromBinary } from '@bufbuild/protobuf'
import { Chain, CosmosChain, EvmChain } from '@core/chain/Chain'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import { getBlockchairBaseUrl } from '@core/chain/chains/utxo/client/getBlockchairBaseUrl'
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
import { z } from 'zod'

import { fastVaultKeysign } from '../shared/fastVaultKeysign'
import { getWalletContext } from '../shared/walletContext'
import type { ToolHandler } from '../types'

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

    const label =
      encodedInputs.length > 1 && i === 0
        ? 'approval'
        : (txType ?? (encodedInputs.length === 1 ? 'transfer' : 'swap'))

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

    if (conversationId && emitEvent) {
      pollTxReceipt({ chain, txHash, conversationId, label, emitEvent })
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

type EmitFn = (event: string, data: Record<string, unknown>) => void

function emitTxStatus(params: {
  emitEvent: EmitFn
  conversationId: string
  txHash: string
  chain: string
  status: 'pending' | 'confirmed' | 'failed'
  label: string
}) {
  const { emitEvent, conversationId, txHash, chain, status, label } = params
  emitEvent('tx_status', { conversationId, txHash, chain, status, label })
}

function pollTxReceipt(params: {
  chain: Chain
  txHash: string
  conversationId: string
  label: string
  emitEvent: EmitFn
}) {
  const { chain, txHash, conversationId, label, emitEvent } = params
  emitTxStatus({
    emitEvent,
    conversationId,
    txHash,
    chain,
    status: 'pending',
    label,
  })

  if (isChainOfKind(chain, 'evm')) {
    pollEvmReceipt({ chain, txHash, conversationId, label, emitEvent })
  } else if (isChainOfKind(chain, 'cosmos')) {
    pollCosmosReceipt({ chain, txHash, conversationId, label, emitEvent })
  } else if (isChainOfKind(chain, 'utxo')) {
    pollUtxoReceipt({ chain, txHash, conversationId, label, emitEvent })
  } else if (isChainOfKind(chain, 'solana')) {
    pollSolanaReceipt({ txHash, conversationId, label, emitEvent })
  }
}

function pollEvmReceipt(params: {
  chain: EvmChain
  txHash: string
  conversationId: string
  label: string
  emitEvent: EmitFn
}) {
  const { chain, txHash, conversationId, label, emitEvent } = params
  const client = getEvmClient(chain)
  const hash = txHash as `0x${string}`

  client
    .waitForTransactionReceipt({ hash, timeout: 180_000 })
    .then(receipt => {
      const status = receipt.status === 'success' ? 'confirmed' : 'failed'
      emitTxStatus({ emitEvent, conversationId, txHash, chain, status, label })
    })
    .catch(() => {
      emitTxStatus({
        emitEvent,
        conversationId,
        txHash,
        chain,
        status: 'failed',
        label,
      })
    })
}

function pollCosmosReceipt(params: {
  chain: CosmosChain
  txHash: string
  conversationId: string
  label: string
  emitEvent: EmitFn
}) {
  const { chain, txHash, conversationId, label, emitEvent } = params
  const isThorMaya = chain === Chain.THORChain || chain === Chain.MayaChain
  const pollInterval = isThorMaya ? 6_000 : 8_000
  const maxAttempts = 30

  const poll = async () => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(r => setTimeout(r, pollInterval))
      try {
        if (isThorMaya) {
          const prefix = chain === Chain.THORChain ? 'thorchain' : 'mayachain'
          const url = `${cosmosRpcUrl[chain]}/${prefix}/tx/${txHash}`
          const resp = await fetch(url)
          if (resp.ok) {
            emitTxStatus({
              emitEvent,
              conversationId,
              txHash,
              chain,
              status: 'confirmed',
              label,
            })
            return
          }
        } else {
          const client = await getCosmosClient(chain)
          const tx = await client.getTx(txHash)
          if (tx) {
            const status = tx.code === 0 ? 'confirmed' : 'failed'
            emitTxStatus({
              emitEvent,
              conversationId,
              txHash,
              chain,
              status,
              label,
            })
            return
          }
        }
      } catch {
        // not indexed yet
      }
    }
    emitTxStatus({
      emitEvent,
      conversationId,
      txHash,
      chain,
      status: 'failed',
      label,
    })
  }
  poll().catch(() => {})
}

function pollUtxoReceipt(params: {
  chain: Chain
  txHash: string
  conversationId: string
  label: string
  emitEvent: EmitFn
}) {
  const { chain, txHash, conversationId, label, emitEvent } = params
  const pollInterval = 15_000
  const maxAttempts = 12

  const poll = async () => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(r => setTimeout(r, pollInterval))
      try {
        const url = `${getBlockchairBaseUrl(chain as any)}/dashboards/transaction/${txHash}`
        const resp = await fetch(url)
        if (resp.ok) {
          const body = await resp.json()
          if (body?.data?.[txHash]) {
            emitTxStatus({
              emitEvent,
              conversationId,
              txHash,
              chain,
              status: 'confirmed',
              label,
            })
            return
          }
        }
      } catch {
        // not confirmed yet
      }
    }
    emitTxStatus({
      emitEvent,
      conversationId,
      txHash,
      chain,
      status: 'failed',
      label,
    })
  }
  poll().catch(() => {})
}

function pollSolanaReceipt(params: {
  txHash: string
  conversationId: string
  label: string
  emitEvent: EmitFn
}) {
  const { txHash, conversationId, label, emitEvent } = params
  const pollInterval = 5_000
  const maxAttempts = 36

  const poll = async () => {
    const client = getSolanaClient()
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(r => setTimeout(r, pollInterval))
      try {
        const result = await client.getSignatureStatuses([txHash])
        const sigStatus = result?.value?.[0]
        if (sigStatus) {
          const status = sigStatus.err ? 'failed' : 'confirmed'
          emitTxStatus({
            emitEvent,
            conversationId,
            txHash,
            chain: Chain.Solana,
            status,
            label,
          })
          return
        }
      } catch {
        // not confirmed yet
      }
    }
    emitTxStatus({
      emitEvent,
      conversationId,
      txHash,
      chain: Chain.Solana,
      status: 'failed',
      label,
    })
  }
  poll().catch(() => {})
}
