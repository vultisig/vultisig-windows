package tools

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	rtypes "github.com/vultisig/recipes/types"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/structpb"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/tss"
)

const (
	fastVaultServerURL = "https://api.vultisig.com/vault"
	policyDerivePath   = "m/44'/60'/0'/0/0"
)

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
		t.logger.WithError(err).Warn("Failed to get policy suggestion, using empty rules")
		suggest = &verifier.PolicySuggest{}
	}

	recipeBase64, err := t.buildProtobufRecipe(pluginID, config, suggest)
	if err != nil {
		return nil, fmt.Errorf("failed to build recipe: %w", err)
	}

	policyVersion := 1
	pluginVersion := "1.0.0"
	messageToSign := fmt.Sprintf("%s*#*%s*#*%d*#*%s", recipeBase64, ctx.VaultPubKey, policyVersion, pluginVersion)

	t.logger.WithField("message", messageToSign).Info("Signing policy message")

	signature, err := t.signWithFastVault(ctx, messageToSign)
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

	return map[string]any{
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
	}, nil
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

func (t *PolicyAddTool) signWithFastVault(ctx *ExecutionContext, message string) (string, error) {
	if ctx.Vault == nil {
		return "", fmt.Errorf("vault is required for signing")
	}
	if ctx.Password == "" {
		return "", fmt.Errorf("password is required for signing")
	}

	vault := ctx.Vault

	messageHash := signing.EthereumSignHash(message)

	sessionID := uuid.New().String()
	encryptionKey := make([]byte, 32)
	_, err := rand.Read(encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to generate encryption key: %w", err)
	}
	hexEncryptionKey := hex.EncodeToString(encryptionKey)

	relayURL := shared.DefaultRelayURL
	relayClient := relay.NewClient(relayURL)

	t.logger.WithFields(logrus.Fields{
		"session_id": sessionID,
		"relay_url":  relayURL,
	}).Info("Registering session on relay")

	err = relayClient.RegisterSession(sessionID, vault.LocalPartyID)
	if err != nil {
		return "", fmt.Errorf("failed to register session: %w", err)
	}

	t.logger.Info("Calling Fast Vault Server to start signing")

	err = t.callFastVaultSign(ctx, sessionID, hexEncryptionKey, []string{messageHash})
	if err != nil {
		return "", fmt.Errorf("failed to call fast vault server: %w", err)
	}

	t.logger.Info("Running TSS keysign protocol")

	results, err := t.tss.Keysign(
		*vault,
		[]string{messageHash},
		vault.LocalPartyID,
		policyDerivePath,
		sessionID,
		hexEncryptionKey,
		relayURL,
		"ecdsa",
	)
	if err != nil {
		return "", fmt.Errorf("keysign failed: %w", err)
	}

	if len(results) == 0 {
		return "", fmt.Errorf("no signature returned from keysign")
	}

	sig := results[0]
	rBytes, err := base64.StdEncoding.DecodeString(sig.R)
	if err != nil {
		return "", fmt.Errorf("failed to decode R: %w", err)
	}
	sBytes, err := base64.StdEncoding.DecodeString(sig.S)
	if err != nil {
		return "", fmt.Errorf("failed to decode S: %w", err)
	}

	recoveryID := sig.RecoveryID
	if recoveryID == "" {
		recoveryID = "1b"
	}
	signature := signing.FormatSignature(hex.EncodeToString(rBytes), hex.EncodeToString(sBytes), recoveryID)

	return signature, nil
}

func (t *PolicyAddTool) callFastVaultSign(ctx *ExecutionContext, sessionID, hexEncryptionKey string, messages []string) error {
	vault := ctx.Vault

	reqBody := map[string]any{
		"public_key":         vault.PublicKeyECDSA,
		"messages":           messages,
		"session":            sessionID,
		"hex_encryption_key": hexEncryptionKey,
		"derive_path":        policyDerivePath,
		"is_ecdsa":           true,
		"vault_password":     ctx.Password,
		"chain":              "Ethereum",
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	signURL := fastVaultServerURL + "/sign"
	t.logger.WithField("url", signURL).Info("Sending sign request to Fast Vault Server")

	req, err := http.NewRequestWithContext(ctx.Ctx, http.MethodPost, signURL, bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("fast vault server returned status %d", resp.StatusCode)
	}

	return nil
}
