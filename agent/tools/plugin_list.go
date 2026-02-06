package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/verifier"
)

type PluginListTool struct {
	client *verifier.Client
}

func NewPluginListTool(client *verifier.Client) *PluginListTool {
	return &PluginListTool{client: client}
}

func (t *PluginListTool) Name() string {
	return "plugin_list"
}

func (t *PluginListTool) Description() string {
	return "List all available plugins from the Vultisig plugin marketplace. Returns plugin ID, name, description, and categories."
}

func (t *PluginListTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *PluginListTool) RequiresPassword() bool {
	return false
}

func (t *PluginListTool) RequiresConfirmation() bool {
	return false
}

func (t *PluginListTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	resp, err := t.client.ListPlugins()
	if err != nil {
		return nil, fmt.Errorf("failed to list plugins: %w", err)
	}

	var plugins []map[string]any
	for _, p := range resp.Plugins {
		plugins = append(plugins, map[string]any{
			"id":          p.ID,
			"title":       p.Title,
			"name":        p.Title,
			"description": p.Description,
			"categories":  p.Categories,
		})
	}

	return map[string]any{
		"plugins":     plugins,
		"total_count": resp.TotalCount,
		"ui": map[string]any{
			"title":   "Available Plugins",
			"summary": fmt.Sprintf("%d plugins available", resp.TotalCount),
		},
	}, nil
}
