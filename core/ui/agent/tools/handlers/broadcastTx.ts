import { Chain, EvmChain } from '@core/chain/Chain'
import { getChainKind, isChainOfKind } from '@core/chain/ChainKind'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'

import type { ToolHandler } from '../types'

export const handleBroadcastTx: ToolHandler = async input => {
  const chain = input.chain as Chain
  const signedTxHex = input.signed_tx_hex as string

  if (!chain || !signedTxHex) {
    throw new Error('chain and signed_tx_hex are required')
  }

  const kind = getChainKind(chain)

  let txHash: string

  switch (kind) {
    case 'evm': {
      txHash = await broadcastEvm(chain as EvmChain, signedTxHex)
      break
    }
    default:
      throw new Error(`broadcast not yet supported for chain kind: ${kind}`)
  }

  if (isChainOfKind(chain, 'evm')) {
    pollEvmReceipt(chain, txHash, input)
  }

  return { data: { tx_hash: txHash } }
}

async function broadcastEvm(
  chain: EvmChain,
  signedTxHex: string
): Promise<string> {
  const client = getEvmClient(chain)
  const serialized = ensureHexPrefix(signedTxHex) as `0x${string}`

  return client.sendRawTransaction({ serializedTransaction: serialized })
}

function pollEvmReceipt(
  chain: EvmChain,
  txHash: string,
  input: Record<string, unknown>
) {
  const conversationId = input.conversation_id as string | undefined
  const label = input.label as string | undefined

  if (!conversationId) return

  const client = getEvmClient(chain)
  const hash = txHash as `0x${string}`

  window.runtime?.EventsEmit('agent:tx_status', {
    conversationId,
    txHash,
    chain,
    status: 'pending',
    label: label ?? '',
  })

  client
    .waitForTransactionReceipt({ hash, timeout: 180_000 })
    .then(receipt => {
      const status = receipt.status === 'success' ? 'confirmed' : 'failed'
      window.runtime?.EventsEmit('agent:tx_status', {
        conversationId,
        txHash,
        chain,
        status,
        label: label ?? '',
      })
    })
    .catch(() => {})
}
