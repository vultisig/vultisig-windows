package tools

import (
	"fmt"
	"strings"

	"github.com/vultisig/vultisig-win/agent/shared"
)

type AssetLookupTool struct{}

func NewAssetLookupTool() *AssetLookupTool {
	return &AssetLookupTool{}
}

func (t *AssetLookupTool) Name() string {
	return "asset_lookup"
}

func (t *AssetLookupTool) Description() string {
	return "Resolve an asset alias to its chain and token information. Supports aliases like 'eth', 'usdc', 'usdc:arbitrum', etc."
}

func (t *AssetLookupTool) InputSchema() map[string]any {
	return map[string]any{
		"asset": map[string]any{
			"type":        "string",
			"description": "Asset alias (e.g., 'eth', 'usdc', 'usdc:arbitrum', 'btc')",
		},
	}
}

func (t *AssetLookupTool) RequiresPassword() bool {
	return false
}

func (t *AssetLookupTool) RequiresConfirmation() bool {
	return false
}

func (t *AssetLookupTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	assetRaw, ok := input["asset"]
	if !ok {
		return nil, fmt.Errorf("asset is required")
	}

	assetStr := strings.TrimSpace(assetRaw.(string))
	asset := shared.ResolveAsset(assetStr)

	if asset == nil {
		availableAssets := make([]string, 0)
		for k := range shared.AssetAliases {
			availableAssets = append(availableAssets, k)
		}
		return map[string]any{
			"found":            false,
			"input":            assetStr,
			"message":          fmt.Sprintf("Asset '%s' not found in known aliases", assetStr),
			"available_assets": availableAssets,
			"ui": map[string]any{
				"title":   "Asset Lookup",
				"summary": fmt.Sprintf("No asset found for %s", assetStr),
			},
		}, nil
	}

	return map[string]any{
		"found":         true,
		"input":         assetStr,
		"chain":         asset.Chain,
		"ticker":        asset.Ticker,
		"token_address": asset.TokenAddress,
		"is_native":     asset.IsNative,
		"decimals":      asset.Decimals,
		"ui": map[string]any{
			"title":   "Asset Lookup",
			"summary": fmt.Sprintf("%s resolves to %s on %s", assetStr, asset.Ticker, asset.Chain),
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Ticker",
					"value": asset.Ticker,
				},
			},
		},
	}, nil
}
