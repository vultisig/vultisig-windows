package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/verifier"
)

type PolicyListTool struct {
	client *verifier.Client
}

func NewPolicyListTool(client *verifier.Client) *PolicyListTool {
	return &PolicyListTool{client: client}
}

func (t *PolicyListTool) Name() string {
	return "policy_list"
}

func (t *PolicyListTool) Description() string {
	return "List policies for a plugin. Shows all active and inactive policies for the current vault."
}

func (t *PolicyListTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias (e.g., 'dca', 'sends')",
		},
		"active": map[string]any{
			"type":        "boolean",
			"description": "Filter by active status (default: true)",
		},
	}
}

func (t *PolicyListTool) RequiresPassword() bool {
	return false
}

func (t *PolicyListTool) RequiresConfirmation() bool {
	return false
}

func (t *PolicyListTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginID := shared.ResolvePluginID(pluginIDRaw.(string))

	active := true
	if activeRaw, ok := input["active"]; ok {
		active = activeRaw.(bool)
	}

	resp, err := t.client.ListPolicies(pluginID, ctx.VaultPubKey, ctx.AuthToken, active)
	if err != nil {
		return nil, fmt.Errorf("failed to list policies: %w", err)
	}

	var policies []map[string]any
	for _, p := range resp.Policies {
		policies = append(policies, map[string]any{
			"id":            p.ID,
			"plugin_id":     p.PluginID,
			"pluginType":    p.PluginID,
			"name":          p.Name,
			"active":        p.Active,
			"isActive":      p.Active,
			"configuration": p.Configuration,
			"created_at":    p.CreatedAt,
		})
	}

	return map[string]any{
		"policies":    policies,
		"total_count": resp.TotalCount,
		"plugin_id":   pluginID,
		"plugin_name": shared.GetPluginName(pluginID),
		"ui": map[string]any{
			"title":   "Policies",
			"summary": fmt.Sprintf("%d policies found", resp.TotalCount),
		},
	}, nil
}
