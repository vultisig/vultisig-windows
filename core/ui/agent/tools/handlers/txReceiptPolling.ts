import {
  Chain,
  CosmosChain,
  EvmChain,
  UtxoBasedChain,
} from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getCosmosClient } from '@vultisig/core-chain/chains/cosmos/client'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { getBlockchairBaseUrl } from '@vultisig/core-chain/chains/utxo/client/getBlockchairBaseUrl'
import { type Hash, isHash } from 'viem'

type TxStatus = 'pending' | 'confirmed' | 'failed'
type TerminalTxStatus = Exclude<TxStatus, 'pending'>
type EmitFn = (event: string, data: Record<string, unknown>) => void

type WaitForEvmReceiptInput = {
  chain: EvmChain
  txHash: Hash
}

type GetCosmosReceiptStatusInput = {
  chain: CosmosChain
  txHash: string
}

type GetUtxoReceiptStatusInput = {
  chain: UtxoBasedChain
  txHash: string
}

type GetSolanaReceiptStatusInput = {
  txHash: string
}

type ReceiptPollingDependencies = {
  sleep: (duration: number) => Promise<void>
  waitForEvmReceipt: (
    input: WaitForEvmReceiptInput
  ) => Promise<TerminalTxStatus>
  getCosmosReceiptStatus: (
    input: GetCosmosReceiptStatusInput
  ) => Promise<TerminalTxStatus | null>
  getUtxoReceiptStatus: (
    input: GetUtxoReceiptStatusInput
  ) => Promise<TerminalTxStatus | null>
  getSolanaReceiptStatus: (
    input: GetSolanaReceiptStatusInput
  ) => Promise<TerminalTxStatus | null>
}

type ReceiptPollingSchedule = {
  cosmos: { pollInterval: number; maxAttempts: number }
  thorMaya: { pollInterval: number; maxAttempts: number }
  utxo: { pollInterval: number; maxAttempts: number }
  solana: { pollInterval: number; maxAttempts: number }
}

const defaultSchedule: ReceiptPollingSchedule = {
  cosmos: { pollInterval: 8_000, maxAttempts: 30 },
  thorMaya: { pollInterval: 6_000, maxAttempts: 30 },
  utxo: { pollInterval: 15_000, maxAttempts: 12 },
  solana: { pollInterval: 5_000, maxAttempts: 36 },
}

const sleep = (duration: number) =>
  new Promise<void>(resolve => setTimeout(resolve, duration))

const defaultDependencies: ReceiptPollingDependencies = {
  sleep,
  waitForEvmReceipt: async ({ chain, txHash }) => {
    const client = getEvmClient(chain)
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      timeout: 180_000,
    })

    return receipt.status === 'success' ? 'confirmed' : 'failed'
  },
  getCosmosReceiptStatus: async ({ chain, txHash }) => {
    const isThorMaya = chain === Chain.THORChain || chain === Chain.MayaChain
    if (isThorMaya) {
      const prefix = chain === Chain.THORChain ? 'thorchain' : 'mayachain'
      const url = `${cosmosRpcUrl[chain]}/${prefix}/tx/${txHash}`
      const response = await fetch(url)

      return response.ok ? 'confirmed' : null
    }

    const client = await getCosmosClient(chain)
    const tx = await client.getTx(txHash)

    if (!tx) return null

    return tx.code === 0 ? 'confirmed' : 'failed'
  },
  getUtxoReceiptStatus: async ({ chain, txHash }) => {
    const url = `${getBlockchairBaseUrl(chain)}/dashboards/transaction/${txHash}`
    const response = await fetch(url)
    if (!response.ok) return null

    const body = await response.json()

    return body?.data?.[txHash] ? 'confirmed' : null
  },
  getSolanaReceiptStatus: async ({ txHash }) => {
    const client = getSolanaClient()
    const result = await client.getSignatureStatuses([txHash])
    const signatureStatus = result?.value?.[0]

    if (!signatureStatus) return null

    if (signatureStatus.err) return 'failed'

    return signatureStatus.confirmationStatus === 'confirmed' ||
      signatureStatus.confirmationStatus === 'finalized'
      ? 'confirmed'
      : null
  },
}

const emitTxStatus = (params: {
  emitEvent: EmitFn
  conversationId: string
  txHash: string
  chain: Chain
  status: TxStatus
  label: string
}) => {
  const { emitEvent, conversationId, txHash, chain, status, label } = params
  emitEvent('tx_status', { conversationId, txHash, chain, status, label })
}

const pollRepeatedly = async (params: {
  observe: () => Promise<TerminalTxStatus | null>
  sleep: ReceiptPollingDependencies['sleep']
  pollInterval: number
  maxAttempts: number
}) => {
  const { observe, sleep, pollInterval, maxAttempts } = params

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(pollInterval)
    try {
      const status = await observe()
      if (status) return status
    } catch {
      // A transport error does not prove that the transaction failed.
    }
  }

  return null
}

type PollTxReceiptInput = {
  chain: Chain
  txHash: string
  conversationId: string
  label: string
  emitEvent: EmitFn
  dependencies?: ReceiptPollingDependencies
  schedule?: ReceiptPollingSchedule
}

/**
 * Emits pending immediately and a terminal status only on positive chain evidence.
 * @param input Transaction context, event sink, and optional polling controls.
 */
export const pollTxReceipt = async ({
  chain,
  txHash,
  conversationId,
  label,
  emitEvent,
  dependencies = defaultDependencies,
  schedule = defaultSchedule,
}: PollTxReceiptInput) => {
  const emitTerminalStatus = (status: TerminalTxStatus) =>
    emitTxStatus({
      emitEvent,
      conversationId,
      txHash,
      chain,
      status,
      label,
    })

  emitTxStatus({
    emitEvent,
    conversationId,
    txHash,
    chain,
    status: 'pending',
    label,
  })

  if (isChainOfKind(chain, 'evm')) {
    if (!isHash(txHash)) return

    try {
      emitTerminalStatus(
        await dependencies.waitForEvmReceipt({ chain, txHash })
      )
    } catch {
      // Timeout or transport failure leaves the last truthful status pending.
    }
    return
  }

  let status: TerminalTxStatus | null = null

  if (isChainOfKind(chain, 'cosmos')) {
    const pollingSchedule =
      chain === Chain.THORChain || chain === Chain.MayaChain
        ? schedule.thorMaya
        : schedule.cosmos
    status = await pollRepeatedly({
      observe: () => dependencies.getCosmosReceiptStatus({ chain, txHash }),
      sleep: dependencies.sleep,
      ...pollingSchedule,
    })
  } else if (isChainOfKind(chain, 'utxo')) {
    status = await pollRepeatedly({
      observe: () => dependencies.getUtxoReceiptStatus({ chain, txHash }),
      sleep: dependencies.sleep,
      ...schedule.utxo,
    })
  } else if (isChainOfKind(chain, 'solana')) {
    status = await pollRepeatedly({
      observe: () => dependencies.getSolanaReceiptStatus({ txHash }),
      sleep: dependencies.sleep,
      ...schedule.solana,
    })
  }

  if (status) emitTerminalStatus(status)
}
