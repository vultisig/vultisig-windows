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

  if (tx.tx_type) {
    params.tx_type = tx.tx_type
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
  }
}

function summarizeTxData(
  td: TxData | undefined
): Record<string, unknown> | undefined {
  if (!td) return undefined
  return {
    to: td.to,
    value: td.value,
    data: td.data,
    nonce: td.nonce,
    gas_limit: td.gas_limit,
    chain_id: td.chain_id,
    memo: td.memo,
  }
}

export function buildTxResultSummary(tx: TxReady): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    status: 'ready',
    from_chain: tx.from_chain,
    from_symbol: tx.from_symbol,
    amount: tx.amount,
    destination: tx.destination,
    sender: tx.sender,
  }

  if (tx.tx_type) {
    summary.tx_type = tx.tx_type
  }

  if (tx.to_chain) summary.to_chain = tx.to_chain
  if (tx.to_symbol) summary.to_symbol = tx.to_symbol
  if (tx.expected_output) summary.expected_output = tx.expected_output
  if (tx.minimum_output) summary.minimum_output = tx.minimum_output
  if (tx.provider) summary.provider = tx.provider
  if (tx.needs_approval != null) summary.needs_approval = tx.needs_approval

  const swapTx = summarizeTxData(tx.swap_tx)
  if (swapTx) {
    summary.swap_tx = swapTx
  }

  const approvalTx = summarizeTxData(tx.approval_tx)
  if (approvalTx) {
    summary.approval_tx = approvalTx
  }

  if (tx.tx_details) {
    summary.tx_details = tx.tx_details
  }

  return summary
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
