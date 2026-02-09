package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/verifier"
)

type PluginUninstallTool struct {
	client *verifier.Client
}

func NewPluginUninstallTool(client *verifier.Client) *PluginUninstallTool {
	return &PluginUninstallTool{client: client}
}

func (t *PluginUninstallTool) Name() string {
	return "plugin_uninstall"
}

func (t *PluginUninstallTool) Description() string {
	return "Uninstall a plugin. This will delete all policies and vault keyshares associated with the plugin."
}

func (t *PluginUninstallTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias (e.g., 'dca', 'sends', 'fee')",
		},
	}
}

func (t *PluginUninstallTool) RequiresPassword() bool {
	return false
}

func (t *PluginUninstallTool) RequiresConfirmation() bool {
	return true
}

func (t *PluginUninstallTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginID := shared.ResolvePluginID(pluginIDRaw.(string))
	pluginName := shared.GetPluginName(pluginID)

	err := t.client.UninstallPlugin(pluginID, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to uninstall plugin: %w", err)
	}

	return map[string]any{
		"success":     true,
		"plugin_id":   pluginID,
		"plugin_name": pluginName,
		"message":     fmt.Sprintf("Plugin %s uninstalled successfully.", pluginName),
		"ui": map[string]any{
			"title": "Plugin Uninstalled",
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Plugin ID",
					"value": pluginID,
				},
			},
		},
	}, nil
}
