import type {
  BackendAction,
  TxBundle,
  TxData,
  TxReady,
  TxTransaction,
} from './types'

function txReadyToTxBundle(tx: TxReady): TxBundle {
  const transactions: TxTransaction[] = []

  if (tx.needs_approval && tx.approval_tx) {
    transactions.push({
      type: 'approval',
      label: 'Approve ' + tx.from_symbol,
      tx_data: tx.approval_tx,
      metadata: { token_symbol: tx.from_symbol },
    })
  }

  if (tx.swap_tx) {
    transactions.push({
      type: 'swap',
      label: tx.from_symbol + ' → ' + tx.to_symbol,
      tx_data: tx.swap_tx,
      metadata: {
        from_chain: tx.from_chain,
        from_symbol: tx.from_symbol,
        to_chain: tx.to_chain,
        to_symbol: tx.to_symbol,
        amount: tx.amount,
        expected_output: tx.expected_output,
        minimum_output: tx.minimum_output,
        destination: tx.destination,
      },
    })
  }

  return {
    transactions,
    chain: tx.from_chain,
    sender: tx.sender,
    metadata: { provider: tx.provider },
  }
}

function marshalTxData(td: TxData): Record<string, unknown> {
  return JSON.parse(JSON.stringify(td)) as Record<string, unknown>
}

export function buildSignTxAction(tx: TxReady): BackendAction {
  const params: Record<string, unknown> = {
    chain: tx.from_chain,
    sender: tx.sender,
  }

  if (tx.keysign_payload) {
    params.keysign_payload = tx.keysign_payload
  } else {
    const bundle = txReadyToTxBundle(tx)
    const txList = bundle.transactions.map(t => {
      const txMap: Record<string, unknown> = {
        type: t.type,
        label: t.label,
        tx_data: marshalTxData(t.tx_data),
      }
      if (t.metadata) {
        txMap.metadata = t.metadata
      }
      return txMap
    })
    params.transactions = txList
    if (bundle.metadata) {
      params.metadata = bundle.metadata
    }
  }

  return {
    id: `sign-tx-${tx.from_chain}`,
    type: 'sign_tx',
    title: 'Sign Transaction',
    params,
    auto_execute: true,
  }
}

export function buildTxResultSummary(tx: TxReady): Record<string, unknown> {
  return {
    status: 'ready',
    from_chain: tx.from_chain,
    from_symbol: tx.from_symbol,
    to_chain: tx.to_chain,
    to_symbol: tx.to_symbol,
    amount: tx.amount,
    expected_output: tx.expected_output,
    minimum_output: tx.minimum_output,
    provider: tx.provider,
    needs_approval: tx.needs_approval,
    destination: tx.destination,
    sender: tx.sender,
  }
}

const retryablePatterns = [
  'status 429',
  'status 502',
  'status 503',
  'status 504',
  'timeout',
  'timed out',
  'no response',
  'connection refused',
  'connection reset',
  'missing wallet addresses',
]

export function isRetryableBuildError(errMsg: string): boolean {
  const lower = errMsg.toLowerCase()
  return retryablePatterns.some(p => lower.includes(p))
}
