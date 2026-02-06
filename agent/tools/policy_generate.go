package tools

import (
	"encoding/json"
	"fmt"

	"github.com/vultisig/vultisig-win/agent/shared"
)

type PolicyGenerateTool struct{}

func NewPolicyGenerateTool() *PolicyGenerateTool {
	return &PolicyGenerateTool{}
}

func (t *PolicyGenerateTool) Name() string {
	return "policy_generate"
}

func (t *PolicyGenerateTool) Description() string {
	return "Generate a policy configuration for a plugin based on user parameters. This creates the JSON configuration that will be submitted."
}

func (t *PolicyGenerateTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias (e.g., 'dca', 'sends')",
		},
		"from_asset": map[string]any{
			"type":        "string",
			"description": "Source asset (e.g., 'eth', 'usdc:arbitrum')",
		},
		"to_asset": map[string]any{
			"type":        "string",
			"description": "Destination asset for swaps (e.g., 'usdc')",
		},
		"to_address": map[string]any{
			"type":        "string",
			"description": "Destination address for sends",
		},
		"amount": map[string]any{
			"type":        "string",
			"description": "Amount to swap/send (e.g., '0.01')",
		},
		"frequency": map[string]any{
			"type":        "string",
			"description": "Execution frequency: 'hourly', 'daily', 'weekly', 'monthly'",
		},
	}
}

func (t *PolicyGenerateTool) RequiresPassword() bool {
	return false
}

func (t *PolicyGenerateTool) RequiresConfirmation() bool {
	return false
}

func (t *PolicyGenerateTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginID := shared.ResolvePluginID(pluginIDRaw.(string))

	config := make(map[string]any)

	if fromAsset, ok := input["from_asset"]; ok {
		asset := shared.ResolveAsset(fromAsset.(string))
		if asset != nil {
			config["from_chain"] = asset.Chain
			config["from_token"] = asset.TokenAddress
			if asset.IsNative {
				config["from_token"] = ""
			}
		} else {
			config["from_asset"] = fromAsset
		}
	}

	if toAsset, ok := input["to_asset"]; ok {
		asset := shared.ResolveAsset(toAsset.(string))
		if asset != nil {
			config["to_chain"] = asset.Chain
			config["to_token"] = asset.TokenAddress
			if asset.IsNative {
				config["to_token"] = ""
			}
		} else {
			config["to_asset"] = toAsset
		}
	}

	if toAddress, ok := input["to_address"]; ok {
		config["to_address"] = toAddress
	}

	if amount, ok := input["amount"]; ok {
		config["amount"] = amount
	}

	if frequency, ok := input["frequency"]; ok {
		config["frequency"] = frequency
	}

	configJSON, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal config: %w", err)
	}

	return map[string]any{
		"plugin_id":     pluginID,
		"plugin_name":   shared.GetPluginName(pluginID),
		"configuration": config,
		"config_json":   string(configJSON),
		"message":       "Policy configuration generated. Review and use policy_add to submit.",
		"ui": map[string]any{
			"title":   "Policy Preview",
			"summary": "Review configuration before creating policy",
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Config JSON",
					"value": string(configJSON),
				},
			},
		},
	}, nil
}
