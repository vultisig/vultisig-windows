import { getTransactions } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

export const handleTransactionHistory: ToolHandler = async (
  _input,
  context
) => {
  const resp = await getTransactions(
    context.vaultPubKey,
    context.authToken ?? ''
  )

  const transactions = (resp.history ?? []).map(tx => ({
    id: tx.id,
    policy_id: tx.policy_id,
    tx_hash: tx.tx_hash,
    txHash: tx.tx_hash,
    status: tx.status,
    chain_status: tx.status_onchain ?? '',
    created_at: tx.created_at,
    date: tx.created_at,
  }))

  return {
    data: {
      transactions,
      total_count: resp.total_count,
      ui: { title: 'Transaction History' },
    },
  }
}
