package tools

import (
	"fmt"
	"time"

	"github.com/vultisig/vultisig-win/agent/shared"
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
	return "Get detailed status and configuration for a specific policy by ID."
}

func (t *PolicyStatusTool) InputSchema() map[string]any {
	return map[string]any{
		"policy_id": map[string]any{
			"type":        "string",
			"description": "The ID of the policy to get details for",
		},
	}
}

func (t *PolicyStatusTool) RequiresPassword() bool {
	return false
}

func (t *PolicyStatusTool) RequiresConfirmation() bool {
	return false
}

func (t *PolicyStatusTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	policyIDRaw, ok := input["policy_id"]
	if !ok {
		return nil, fmt.Errorf("policy_id is required")
	}

	policyID, ok := policyIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("policy_id must be a string")
	}

	policy, err := t.client.GetPolicyFull(policyID, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to get policy: %w", err)
	}

	config := resolveConfiguration(*policy, t.client, ctx.AuthToken)

	result := map[string]any{
		"policy_id":     policy.ID,
		"plugin_id":     policy.PluginID,
		"plugin_name":   shared.GetPluginName(policy.PluginID),
		"active":        policy.Active,
		"configuration": config,
		"created_at":    policy.CreatedAt,
	}

	enrichPolicyFields(result, config)

	if policy.Active {
		freq, _ := result["frequency"].(string)
		nextExec := computeNextExecution(policy.CreatedAt, freq)
		if nextExec != "" {
			result["next_execution"] = nextExec
		}
	}

	return result, nil
}

func computeNextExecution(createdAt string, frequency string) string {
	created, err := time.Parse(time.RFC3339, createdAt)
	if err != nil {
		created, err = time.Parse("2006-01-02T15:04:05Z", createdAt)
		if err != nil {
			return ""
		}
	}

	var interval time.Duration
	switch frequency {
	case "hourly":
		interval = time.Hour
	case "daily":
		interval = 24 * time.Hour
	case "weekly":
		interval = 7 * 24 * time.Hour
	case "monthly":
		now := time.Now().UTC()
		next := created
		for !next.After(now) {
			next = next.AddDate(0, 1, 0)
		}
		return next.Format(time.RFC3339)
	default:
		return ""
	}

	now := time.Now().UTC()
	elapsed := now.Sub(created)
	if elapsed < 0 {
		return created.Format(time.RFC3339)
	}

	periods := int(elapsed/interval) + 1
	next := created.Add(time.Duration(periods) * interval)
	return next.Format(time.RFC3339)
}
