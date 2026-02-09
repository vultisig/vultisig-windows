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

	pluginID := shared.ResolvePluginID(pluginIDRaw.(string))
	config := configRaw.(map[string]any)
	billing := normalizeBilling(input["billing"])

	suggest, err := t.client.SuggestPolicy(pluginID, config)
	if err != nil {
		return nil, fmt.Errorf("failed to get policy rules from plugin: %w", err)
	}

	recipeBase64, err := t.buildProtobufRecipe(pluginID, config, suggest)
	if err != nil {
		return nil, fmt.Errorf("failed to build recipe: %w", err)
	}

	policyVersion := 0
	pluginVersion := t.resolvePluginVersion(pluginID)
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
		"message":     fmt.Sprintf("Policy created successfully! ID: %s. Use policy_status to check execution schedule.", resp.ID),
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

func (t *PolicyAddTool) resolvePluginVersion(pluginID string) string {
	const fallbackVersion = "1.0.0"
	plugin, err := t.client.GetPlugin(pluginID)
	if err != nil {
		t.logger.WithError(err).WithField("plugin_id", pluginID).Warn("Failed to fetch plugin version, using fallback")
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

func (t *PolicyAddTool) buildProtobufRecipe(pluginID string, config map[string]any, suggest *verifier.PolicySuggest) (string, error) {
	configuration, err := structpb.NewStruct(config)
	if err != nil {
		return "", fmt.Errorf("failed to create struct: %w", err)
	}

	var rules []*rtypes.Rule
	for _, r := range suggest.Rules {
		effect := rtypes.Effect_EFFECT_ALLOW
		if r.Effect == "deny" {
			effect = rtypes.Effect_EFFECT_DENY
		}
		rules = append(rules, &rtypes.Rule{
			Resource:    r.Resource,
			Effect:      effect,
			Description: r.Description,
		})
	}

	policy := &rtypes.Policy{
		Id:            pluginID,
		Configuration: configuration,
		Rules:         rules,
	}

	if suggest.RateLimitWindow > 0 {
		window := uint32(suggest.RateLimitWindow)
		policy.RateLimitWindow = &window
	}
	if suggest.MaxTxsPerWindow > 0 {
		maxTxs := uint32(suggest.MaxTxsPerWindow)
		policy.MaxTxsPerWindow = &maxTxs
	}

	policyBytes, err := proto.Marshal(policy)
	if err != nil {
		return "", fmt.Errorf("failed to marshal policy: %w", err)
	}

	return base64.StdEncoding.EncodeToString(policyBytes), nil
}

