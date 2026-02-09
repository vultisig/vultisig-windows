package tools

import (
	"fmt"

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

	policyID := policyIDRaw.(string)

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

	return result, nil
}
