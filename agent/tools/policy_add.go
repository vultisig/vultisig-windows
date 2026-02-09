package tools

import (
	"encoding/base64"
	"fmt"

	"github.com/sirupsen/logrus"
	rtypes "github.com/vultisig/recipes/types"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/structpb"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/tss"
)

const policyDerivePath = "m/44'/60'/0'/0/0"

type PolicyAddTool struct {
	client *verifier.Client
	tss    *tss.TssService
	logger *logrus.Logger
}

func NewPolicyAddTool(client *verifier.Client, tss *tss.TssService) *PolicyAddTool {
	return &PolicyAddTool{
		client: client,
		tss:    tss,
		logger: logrus.WithField("module", "policy_add").Logger,
	}
}

func (t *PolicyAddTool) Name() string {
	return "policy_add"
}

func (t *PolicyAddTool) Description() string {
	return "Submit a policy to the verifier. This requires TSS signing and will activate the policy."
}

func (t *PolicyAddTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias",
		},
		"configuration": map[string]any{
			"type":        "object",
			"description": "The policy configuration object",
		},
	}
}

func (t *PolicyAddTool) RequiresPassword() bool {
	return true
}

func (t *PolicyAddTool) RequiresConfirmation() bool {
	return true
}

func (t *PolicyAddTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	configRaw, ok := input["configuration"]
	if !ok {
		return nil, fmt.Errorf("configuration is required")
	}

	pluginIDStr, ok := pluginIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("plugin_id must be a string")
	}
	pluginID := shared.ResolvePluginID(pluginIDStr)
	config, ok := configRaw.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("configuration must be an object")
	}
	billing := normalizeBilling(input["billing"])

	plugin, err := t.client.GetPlugin(pluginID)
	if err != nil {
		t.logger.WithError(err).Warn("Failed to fetch plugin info")
	}

	if len(billing) == 0 && plugin != nil && len(plugin.Pricing) > 0 {
		billing = billingFromPricing(plugin.Pricing)
	}

	suggest, err := t.client.SuggestPolicy(pluginID, config)
	if err != nil {
		t.logger.WithError(err).Warn("SuggestPolicy failed, using empty rules fallback")
		suggest = &rtypes.PolicySuggest{}
	}

	recipeBase64, err := t.buildProtobufRecipe(pluginID, config, suggest)
	if err != nil {
		return nil, fmt.Errorf("failed to build recipe: %w", err)
	}

	policyVersion := 0
	pluginVersion := resolveVersionFromPlugin(plugin)
	messageToSign := fmt.Sprintf("%s*#*%s*#*%d*#*%s", recipeBase64, ctx.VaultPubKey, policyVersion, pluginVersion)

	t.logger.WithField("message", messageToSign).Info("Signing policy message")

	messageHash := signing.EthereumSignHash(messageToSign)
	cfg := KeysignConfig{
		AppCtx:     ctx.AppCtx,
		Ctx:        ctx.Ctx,
		Vault:      ctx.Vault,
		Password:   ctx.Password,
		DerivePath: policyDerivePath,
		TSS:        t.tss,
		Logger:     t.logger,
	}
	signature, err := FastVaultKeysign(cfg, messageHash)
	if err != nil {
		return nil, fmt.Errorf("failed to sign policy: %w", err)
	}

	t.logger.WithField("signature", signature).Info("Policy signed successfully")

	req := &verifier.PolicyAddRequest{
		PluginID:      pluginID,
		PublicKey:     ctx.VaultPubKey,
		PluginVersion: pluginVersion,
		PolicyVersion: policyVersion,
		Signature:     signature,
		Recipe:        recipeBase64,
		Billing:       billing,
		Active:        true,
	}

	resp, err := t.client.AddPolicy(req, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to add policy: %w", err)
	}

	result := map[string]any{
		"success":     true,
		"policy_id":   resp.ID,
		"plugin_id":   pluginID,
		"plugin_name": shared.GetPluginName(pluginID),
		"message":     fmt.Sprintf("Policy created successfully (ID: %s).", resp.ID),
		"ui": map[string]any{
			"title": "Policy Created",
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Policy ID",
					"value": resp.ID,
				},
			},
		},
	}

	var fromChain, fromToken string
	if pluginID == sendsPluginID {
		if assetObj, ok := config["asset"].(map[string]any); ok {
			fromChain = fmt.Sprintf("%v", assetObj["chain"])
			if t, ok := assetObj["token"]; ok && t != nil {
				fromToken = fmt.Sprintf("%v", t)
			}
			result["from_asset"] = shared.ResolveTickerByChainAndToken(fromChain, fromToken)
			result["from_chain"] = fromChain
		}
		if recipients, ok := config["recipients"].([]any); ok && len(recipients) > 0 {
			if r, ok := recipients[0].(map[string]any); ok {
				if addr, ok := r["toAddress"]; ok {
					result["to_address"] = fmt.Sprintf("%v", addr)
				}
				if amt, ok := r["amount"]; ok {
					result["amount"] = shared.FormatHumanAmount(fmt.Sprintf("%v", amt), fromChain, fromToken)
				}
			}
		}
	} else {
		if fromObj, ok := config["from"].(map[string]any); ok {
			fromChain = fmt.Sprintf("%v", fromObj["chain"])
			if t, ok := fromObj["token"]; ok && t != nil {
				fromToken = fmt.Sprintf("%v", t)
			}
			result["from_asset"] = shared.ResolveTickerByChainAndToken(fromChain, fromToken)
			result["from_chain"] = fromChain
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
		if amount, ok := config["fromAmount"]; ok {
			result["amount"] = shared.FormatHumanAmount(fmt.Sprintf("%v", amount), fromChain, fromToken)
		}
	}

	if freq, ok := config["frequency"]; ok {
		result["frequency"] = fmt.Sprintf("%v", freq)
	}

	return result, nil
}

func normalizeBilling(raw any) []any {
	if raw == nil {
		return nil
	}
	if items, ok := raw.([]any); ok {
		return items
	}
	if item, ok := raw.(map[string]any); ok {
		return []any{item}
	}
	return nil
}

func resolveVersionFromPlugin(plugin *verifier.Plugin) string {
	const fallbackVersion = "1.0.0"
	if plugin == nil {
		return fallbackVersion
	}
	if plugin.Version != "" {
		return plugin.Version
	}
	if plugin.PluginVersion != "" {
		return plugin.PluginVersion
	}
	return fallbackVersion
}

func billingFromPricing(pricing []verifier.AppPricing) []any {
	var billing []any
	for _, p := range pricing {
		if p.Amount <= 0 {
			continue
		}
		entry := map[string]any{
			"amount": p.Amount,
			"asset":  p.Asset,
		}
		if p.Type != "" {
			entry["type"] = p.Type
		}
		if p.Frequency != "" {
			entry["frequency"] = p.Frequency
		}
		billing = append(billing, entry)
	}
	return billing
}

func (t *PolicyAddTool) buildProtobufRecipe(pluginID string, config map[string]any, suggest *rtypes.PolicySuggest) (string, error) {
	configuration, err := structpb.NewStruct(config)
	if err != nil {
		return "", fmt.Errorf("failed to create struct: %w", err)
	}

	policy := &rtypes.Policy{
		Id:              pluginID,
		Configuration:   configuration,
		Rules:           suggest.Rules,
		RateLimitWindow: suggest.RateLimitWindow,
		MaxTxsPerWindow: suggest.MaxTxsPerWindow,
	}

	policyBytes, err := proto.Marshal(policy)
	if err != nil {
		return "", fmt.Errorf("failed to marshal policy: %w", err)
	}

	return base64.StdEncoding.EncodeToString(policyBytes), nil
}

