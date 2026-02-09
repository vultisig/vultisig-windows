package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/verifier"
)

type PluginInstalledTool struct {
	client *verifier.Client
}

func NewPluginInstalledTool(client *verifier.Client) *PluginInstalledTool {
	return &PluginInstalledTool{client: client}
}

func (t *PluginInstalledTool) Name() string {
	return "plugin_installed"
}

func (t *PluginInstalledTool) Description() string {
	return "Check if a plugin is installed for the current vault. Returns true/false."
}

func (t *PluginInstalledTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias to check",
		},
	}
}

func (t *PluginInstalledTool) RequiresPassword() bool {
	return false
}

func (t *PluginInstalledTool) RequiresConfirmation() bool {
	return false
}

func (t *PluginInstalledTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginIDStr, ok := pluginIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("plugin_id must be a string")
	}
	pluginID := shared.ResolvePluginID(pluginIDStr)

	installed, err := t.client.CheckPluginInstalled(pluginID, ctx.VaultPubKey, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to check plugin installation: %w", err)
	}

	return map[string]any{
		"plugin_id":   pluginID,
		"plugin_name": shared.GetPluginName(pluginID),
		"installed":   installed,
		"message": func() string {
			if installed {
				return fmt.Sprintf("Plugin %s is installed for this vault", shared.GetPluginName(pluginID))
			}
			return fmt.Sprintf("Plugin %s is not installed.", shared.GetPluginName(pluginID))
		}(),
		"ui": map[string]any{
			"title": "Plugin Status",
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
