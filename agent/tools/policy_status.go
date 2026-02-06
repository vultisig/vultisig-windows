package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/verifier"
)

type PolicyStatusTool struct {
	client *verifier.Client
}

func NewPolicyStatusTool(client *verifier.Client) *PolicyStatusTool {
	return &PolicyStatusTool{client: client}
}

func (t *PolicyStatusTool) Name() string {
	return "policy_status"
}

func (t *PolicyStatusTool) Description() string {
	return "Get the status and transaction history for a vault. Shows recent transactions and their status."
}

func (t *PolicyStatusTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *PolicyStatusTool) RequiresPassword() bool {
	return false
}

func (t *PolicyStatusTool) RequiresConfirmation() bool {
	return false
}

func (t *PolicyStatusTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
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
