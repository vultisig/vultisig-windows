package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/verifier"
)

type TransactionHistoryTool struct {
	client *verifier.Client
}

func NewTransactionHistoryTool(client *verifier.Client) *TransactionHistoryTool {
	return &TransactionHistoryTool{client: client}
}

func (t *TransactionHistoryTool) Name() string {
	return "transaction_history"
}

func (t *TransactionHistoryTool) Description() string {
	return "Get transaction history for the vault. Shows recent transactions and their status."
}

func (t *TransactionHistoryTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *TransactionHistoryTool) RequiresPassword() bool {
	return false
}

func (t *TransactionHistoryTool) RequiresConfirmation() bool {
	return false
}

func (t *TransactionHistoryTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	resp, err := t.client.GetTransactions(ctx.VaultPubKey, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get transactions: %w", err)
	}

	var transactions []map[string]any
	for _, tx := range resp.History {
		transactions = append(transactions, map[string]any{
			"id":           tx.ID,
			"policy_id":    tx.PolicyID,
			"tx_hash":      tx.TxHash,
			"txHash":       tx.TxHash,
			"status":       tx.Status,
			"chain_status": tx.ChainStatus,
			"created_at":   tx.CreatedAt,
			"date":         tx.CreatedAt,
		})
	}

	return map[string]any{
		"transactions": transactions,
		"total_count":  resp.TotalCount,
		"ui": map[string]any{
			"title": "Transaction History",
		},
	}, nil
}
