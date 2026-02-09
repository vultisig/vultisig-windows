package tools

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/storage"
)

const sendsPluginID = "vultisig-recurring-sends-0000"

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
		"to_chain": map[string]any{
			"type":        "string",
			"description": "Destination chain for sends (defaults to same as from_asset chain)",
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

	pluginIDStr, ok := pluginIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("plugin_id must be a string")
	}
	pluginID := shared.ResolvePluginID(pluginIDStr)

	var config map[string]any
	if pluginID == sendsPluginID {
		config = buildSendsConfig(input, ctx)
	} else {
		config = buildSwapConfig(input, ctx)
	}

	if frequency, ok := input["frequency"]; ok {
		config["frequency"] = frequency
	}

	configJSON, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal config: %w", err)
	}

	result := map[string]any{
		"plugin_id":     pluginID,
		"plugin_name":   shared.GetPluginName(pluginID),
		"configuration": config,
		"config_json":   string(configJSON),
		"message":       "Policy configuration generated. Ready for review.",
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
	}

	addDisplayFields(result, config, input, pluginID)

	return result, nil
}

func buildSendsConfig(input map[string]any, ctx *ExecutionContext) map[string]any {
	config := make(map[string]any)

	var fromAsset *shared.AssetInfo
	if fromAssetRaw, ok := input["from_asset"]; ok {
		if s, ok := fromAssetRaw.(string); ok {
			fromAsset = shared.ResolveAsset(s)
		}
	}

	if fromAsset != nil {
		assetObj := map[string]any{
			"chain":   fromAsset.Chain,
			"token":   fromAsset.TokenAddress,
			"address": findVaultAddress(ctx.Vault, fromAsset.Chain),
		}
		if fromAsset.IsNative {
			assetObj["token"] = ""
		}
		config["asset"] = assetObj
	}

	recipient := map[string]any{}
	if toAddr, ok := input["to_address"]; ok {
		recipient["toAddress"] = fmt.Sprintf("%v", toAddr)
	}
	if amount, ok := input["amount"]; ok {
		amountStr := fmt.Sprintf("%v", amount)
		if fromAsset != nil && fromAsset.Decimals > 0 {
			amountStr = convertToSmallestUnit(amountStr, fromAsset.Decimals)
		}
		recipient["amount"] = amountStr
	}
	config["recipients"] = []any{recipient}

	return config
}

func buildSwapConfig(input map[string]any, ctx *ExecutionContext) map[string]any {
	config := make(map[string]any)

	var fromAsset *shared.AssetInfo
	if fromAssetRaw, ok := input["from_asset"]; ok {
		if s, ok := fromAssetRaw.(string); ok {
			fromAsset = shared.ResolveAsset(s)
		}
		if fromAsset != nil {
			fromObj := map[string]any{
				"chain":   fromAsset.Chain,
				"token":   fromAsset.TokenAddress,
				"address": findVaultAddress(ctx.Vault, fromAsset.Chain),
			}
			if fromAsset.IsNative {
				fromObj["token"] = ""
			}
			config["from"] = fromObj
		}
	}

	if toAssetRaw, ok := input["to_asset"]; ok {
		toAssetStr, _ := toAssetRaw.(string)
		toAsset := shared.ResolveAsset(toAssetStr)
		if toAsset != nil {
			toObj := map[string]any{
				"chain":   toAsset.Chain,
				"token":   toAsset.TokenAddress,
				"address": findVaultAddress(ctx.Vault, toAsset.Chain),
			}
			if toAsset.IsNative {
				toObj["token"] = ""
			}
			if addrRaw, ok := input["to_address"]; ok {
				toObj["address"] = addrRaw
			}
			config["to"] = toObj
		}
	} else if toAddrRaw, ok := input["to_address"]; ok {
		toAddr := fmt.Sprintf("%v", toAddrRaw)
		toChain := ""
		if fromAsset != nil {
			toChain = fromAsset.Chain
		}
		if toChainRaw, ok := input["to_chain"]; ok {
			toChain = fmt.Sprintf("%v", toChainRaw)
		}
		config["to"] = map[string]any{
			"address": toAddr,
			"chain":   toChain,
		}
	}

	if amount, ok := input["amount"]; ok {
		amountStr := fmt.Sprintf("%v", amount)
		var fromAssetLocal *shared.AssetInfo
		if fromAssetRaw, ok := input["from_asset"]; ok {
			if s, ok := fromAssetRaw.(string); ok {
				fromAssetLocal = shared.ResolveAsset(s)
			}
		}
		if fromAssetLocal != nil && fromAssetLocal.Decimals > 0 {
			amountStr = convertToSmallestUnit(amountStr, fromAssetLocal.Decimals)
		}
		config["fromAmount"] = amountStr
	}

	return config
}

func addDisplayFields(result, config map[string]any, input map[string]any, pluginID string) {
	if pluginID == sendsPluginID {
		if assetObj, ok := config["asset"].(map[string]any); ok {
			chain := fmt.Sprintf("%v", assetObj["chain"])
			token := ""
			if t, ok := assetObj["token"]; ok && t != nil {
				token = fmt.Sprintf("%v", t)
			}
			result["from_asset"] = shared.ResolveTickerByChainAndToken(chain, token)
			result["from_chain"] = chain
		}
		if recipients, ok := config["recipients"].([]any); ok && len(recipients) > 0 {
			if r, ok := recipients[0].(map[string]any); ok {
				if addr, ok := r["toAddress"]; ok {
					result["to_address"] = fmt.Sprintf("%v", addr)
				}
			}
		}
	} else {
		if fromObj, ok := config["from"].(map[string]any); ok {
			chain := fmt.Sprintf("%v", fromObj["chain"])
			token := ""
			if t, ok := fromObj["token"]; ok && t != nil {
				token = fmt.Sprintf("%v", t)
			}
			result["from_asset"] = shared.ResolveTickerByChainAndToken(chain, token)
			result["from_chain"] = chain
		}
		if toObj, ok := config["to"].(map[string]any); ok {
			chain := fmt.Sprintf("%v", toObj["chain"])
			token := ""
			if t, ok := toObj["token"]; ok && t != nil {
				token = fmt.Sprintf("%v", t)
			}
			result["to_asset"] = shared.ResolveTickerByChainAndToken(chain, token)
			result["to_chain"] = chain
		}
	}

	if amount, ok := input["amount"]; ok {
		result["amount"] = fmt.Sprintf("%v", amount)
	}
	if frequency, ok := config["frequency"]; ok {
		result["frequency"] = fmt.Sprintf("%v", frequency)
	}
}

func convertToSmallestUnit(amount string, decimals int) string {
	parts := strings.Split(amount, ".")
	intPart := parts[0]
	fracPart := ""
	if len(parts) > 1 {
		fracPart = parts[1]
	}

	if len(fracPart) < decimals {
		fracPart = fracPart + strings.Repeat("0", decimals-len(fracPart))
	} else if len(fracPart) > decimals {
		fracPart = fracPart[:decimals]
	}

	combined := strings.TrimLeft(intPart+fracPart, "0")
	if combined == "" {
		return "0"
	}

	r := new(big.Int)
	_, ok := r.SetString(combined, 10)
	if !ok {
		return amount
	}
	return r.String()
}

func findVaultAddress(vault *storage.Vault, chain string) string {
	if vault == nil {
		return ""
	}
	for _, coin := range vault.Coins {
		if strings.EqualFold(coin.Chain, chain) && coin.IsNativeToken {
			return coin.Address
		}
	}
	for _, coin := range vault.Coins {
		if strings.EqualFold(coin.Chain, chain) {
			return coin.Address
		}
	}
	return ""
}
