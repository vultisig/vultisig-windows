package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/verifier"
)

type PluginSpecTool struct {
	client *verifier.Client
}

func NewPluginSpecTool(client *verifier.Client) *PluginSpecTool {
	return &PluginSpecTool{client: client}
}

func (t *PluginSpecTool) Name() string {
	return "plugin_spec"
}

func (t *PluginSpecTool) Description() string {
	return "Get the recipe specification for a plugin. This shows what configuration options are available and how to create policies for this plugin."
}

func (t *PluginSpecTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias (e.g., 'dca', 'sends', 'fees', or full ID)",
		},
	}
}

func (t *PluginSpecTool) RequiresPassword() bool {
	return false
}

func (t *PluginSpecTool) RequiresConfirmation() bool {
	return false
}

func (t *PluginSpecTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginIDStr, ok := pluginIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("plugin_id must be a string")
	}
	pluginID := shared.ResolvePluginID(pluginIDStr)

	spec, err := t.client.GetRecipeSpecification(pluginID)
	if err != nil {
		return nil, fmt.Errorf("failed to get recipe specification: %w", err)
	}

	plugin, err := t.client.GetPlugin(pluginID)
	if err != nil {
		return nil, fmt.Errorf("failed to get plugin info: %w", err)
	}

	result := map[string]any{
		"plugin_id":             pluginID,
		"plugin_name":           plugin.Title,
		"description":           spec.Description,
		"configuration_schema":  spec.ConfigurationSchema,
		"configuration_example": spec.ConfigurationExample,
		"supported_chains":      spec.SupportedChains,
		"supported_assets":      spec.SupportedAssets,
		"required_fields":       spec.RequiredFields,
		"ui": map[string]any{
			"title":   "Plugin Details",
			"summary": spec.Description,
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Plugin ID",
					"value": pluginID,
				},
			},
		},
	}

	pricingText := formatPluginPricing(plugin.Pricing)
	if pricingText != "" {
		result["pricing"] = pricingText
	} else {
		result["pricing"] = "Free"
	}

	return result, nil
}
