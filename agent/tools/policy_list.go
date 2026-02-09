package tools

import (
	"encoding/base64"
	"fmt"
	"math/big"
	"strings"

	rtypes "github.com/vultisig/recipes/types"
	"google.golang.org/protobuf/proto"

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
	return "List policies. When plugin_id is omitted, lists policies across ALL plugins. Shows full configuration details (assets, amounts, frequency)."
}

func (t *PolicyListTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "Optional plugin ID or alias (e.g., 'dca', 'sends'). Omit to list all plugins.",
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
	active := true
	if activeRaw, ok := input["active"]; ok {
		if b, ok := activeRaw.(bool); ok {
			active = b
		}
	}

	var pluginIDs []string
	if pluginIDRaw, ok := input["plugin_id"]; ok {
		pluginIDStr, ok := pluginIDRaw.(string)
		if !ok {
			return nil, fmt.Errorf("plugin_id must be a string")
		}
		pluginIDs = append(pluginIDs, shared.ResolvePluginID(pluginIDStr))
	} else {
		for _, p := range shared.KnownPlugins {
			pluginIDs = append(pluginIDs, p.ID)
		}
	}

	var allPolicies []map[string]any
	var errors []string
	for _, pluginID := range pluginIDs {
		resp, err := t.client.ListPolicies(pluginID, ctx.VaultPubKey, ctx.AuthToken, active)
		if err != nil {
			errors = append(errors, fmt.Sprintf("%s: %s", shared.GetPluginName(pluginID), err.Error()))
			continue
		}
		for _, p := range resp.Policies {
			config := resolveConfiguration(p, t.client, ctx.AuthToken)

			policy := map[string]any{
				"id":            p.ID,
				"plugin_id":     p.PluginID,
				"pluginType":    p.PluginID,
				"plugin_name":   shared.GetPluginName(p.PluginID),
				"active":        p.Active,
				"isActive":      p.Active,
				"configuration": config,
				"created_at":    p.CreatedAt,
			}
			enrichPolicyFields(policy, config)
			allPolicies = append(allPolicies, policy)
		}
	}

	if len(allPolicies) == 0 && len(errors) == len(pluginIDs) {
		return nil, fmt.Errorf("failed to list policies: %s", strings.Join(errors, "; "))
	}

	totalCount := len(allPolicies)
	return map[string]any{
		"policies":    allPolicies,
		"total_count": totalCount,
		"ui": map[string]any{
			"title":   "Policies",
			"summary": fmt.Sprintf("%d policies found", totalCount),
		},
	}, nil
}

func resolveConfiguration(p verifier.Policy, client *verifier.Client, authToken string) map[string]any {
	if len(p.Configuration) > 0 {
		return p.Configuration
	}

	if p.Recipe != "" {
		config := decodeRecipeConfig(p.Recipe)
		if config != nil {
			return config
		}
	}

	full, err := client.GetPolicyFull(p.ID, authToken)
	if err != nil {
		return nil
	}
	if len(full.Configuration) > 0 {
		return full.Configuration
	}
	if full.Recipe != "" {
		return decodeRecipeConfig(full.Recipe)
	}

	return nil
}

func decodeRecipeConfig(recipeBase64 string) map[string]any {
	data, err := base64.StdEncoding.DecodeString(recipeBase64)
	if err != nil {
		return nil
	}

	var policy rtypes.Policy
	err = proto.Unmarshal(data, &policy)
	if err != nil {
		return nil
	}

	if policy.Configuration == nil {
		return nil
	}

	return policy.Configuration.AsMap()
}

func enrichPolicyFields(policy map[string]any, config map[string]any) {
	if config == nil {
		return
	}

	fromChain, fromToken, fromTicker := resolveConfigAsset(config, "from")
	if fromTicker != "" {
		policy["from_asset"] = fromTicker
		policy["fromAsset"] = fromTicker
		policy["from_chain"] = fromChain
	}

	toChain, toToken, toTicker := resolveConfigAsset(config, "to")
	_ = toToken
	if toTicker != "" {
		policy["to_asset"] = toTicker
		policy["toAsset"] = toTicker
		policy["to_chain"] = toChain
	}

	if rawAmount, ok := config["fromAmount"]; ok {
		amountStr := fmt.Sprintf("%v", rawAmount)
		humanAmount := convertFromSmallestUnit(amountStr, fromChain, fromToken)
		policy["amount"] = humanAmount
	}

	if freq, ok := config["frequency"]; ok {
		policy["frequency"] = fmt.Sprintf("%v", freq)
		policy["schedule"] = fmt.Sprintf("%v", freq)
	}
}

func resolveConfigAsset(config map[string]any, field string) (chain, token, ticker string) {
	raw, ok := config[field]
	if !ok {
		return "", "", ""
	}
	obj, ok := raw.(map[string]any)
	if !ok {
		return "", "", ""
	}

	chain = fmt.Sprintf("%v", obj["chain"])
	if t, ok := obj["token"]; ok && t != nil {
		token = fmt.Sprintf("%v", t)
	}
	ticker = shared.ResolveTickerByChainAndToken(chain, token)
	return chain, token, ticker
}

func convertFromSmallestUnit(amountStr, chain, tokenAddress string) string {
	decimals := lookupDecimals(chain, tokenAddress)
	if decimals == 0 {
		return amountStr
	}

	val := new(big.Int)
	_, ok := val.SetString(amountStr, 10)
	if !ok {
		return amountStr
	}

	divisor := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals)), nil)
	whole := new(big.Int).Div(val, divisor)
	remainder := new(big.Int).Mod(val, divisor)

	if remainder.Sign() == 0 {
		return whole.String()
	}

	fracStr := remainder.String()
	if len(fracStr) < decimals {
		fracStr = strings.Repeat("0", decimals-len(fracStr)) + fracStr
	}
	fracStr = strings.TrimRight(fracStr, "0")

	return whole.String() + "." + fracStr
}

func lookupDecimals(chain, tokenAddress string) int {
	for _, asset := range shared.AssetAliases {
		if !strings.EqualFold(asset.Chain, chain) {
			continue
		}
		if tokenAddress == "" && asset.IsNative {
			return asset.Decimals
		}
		if tokenAddress != "" && strings.EqualFold(asset.TokenAddress, tokenAddress) {
			return asset.Decimals
		}
	}
	return 0
}
