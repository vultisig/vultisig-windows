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

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/tss"
)

const (
	deleteDerivePath = "m/44'/60'/0'/0/0"
)

type PolicyDeleteTool struct {
	client *verifier.Client
	tss    *tss.TssService
	logger *logrus.Logger
}

func NewPolicyDeleteTool(client *verifier.Client, tss *tss.TssService) *PolicyDeleteTool {
	return &PolicyDeleteTool{
		client: client,
		tss:    tss,
		logger: logrus.WithField("module", "policy_delete").Logger,
	}
}

func (t *PolicyDeleteTool) Name() string {
	return "policy_delete"
}

func (t *PolicyDeleteTool) Description() string {
	return "Delete a policy. This requires TSS signing."
}

func (t *PolicyDeleteTool) InputSchema() map[string]any {
	return map[string]any{
		"policy_id": map[string]any{
			"type":        "string",
			"description": "The ID of the policy to delete",
		},
	}
}

func (t *PolicyDeleteTool) RequiresPassword() bool {
	return true
}

func (t *PolicyDeleteTool) RequiresConfirmation() bool {
	return true
}

func (t *PolicyDeleteTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	policyIDRaw, ok := input["policy_id"]
	if !ok {
		return nil, fmt.Errorf("policy_id is required")
	}

	policyID := policyIDRaw.(string)

	policyDetails, err := t.client.GetPolicy(policyID, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch policy: %w", err)
	}

	pluginVersion := policyDetails.PluginVersion
	if pluginVersion == "" {
		pluginVersion = "1.0.0"
	}

	messageToSign := fmt.Sprintf(
		"%s*#*%s*#*%d*#*%s",
		policyDetails.Recipe,
		policyDetails.PublicKey,
		policyDetails.PolicyVersion,
		pluginVersion,
	)

	t.logger.WithField("message", messageToSign).Info("Signing delete message")

	signature, err := t.signWithFastVault(ctx, messageToSign)
	if err != nil {
		return nil, fmt.Errorf("failed to sign delete request: %w", err)
	}

	t.logger.WithField("signature", signature).Info("Delete signed successfully")

	err = t.client.DeletePolicy(policyID, signature, ctx.AuthToken)
	if err != nil {
		return nil, fmt.Errorf("failed to delete policy: %w", err)
	}

	return map[string]any{
		"success":   true,
		"policy_id": policyID,
		"message":   fmt.Sprintf("Policy %s deleted successfully.", policyID),
		"ui": map[string]any{
			"title": "Policy Deleted",
			"actions": []map[string]any{
				{
					"type":  "copy",
					"label": "Copy Policy ID",
					"value": policyID,
				},
			},
		},
	}, nil
}

func (t *PolicyDeleteTool) signWithFastVault(ctx *ExecutionContext, message string) (string, error) {
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
		deleteDerivePath,
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

func (t *PolicyDeleteTool) callFastVaultSign(ctx *ExecutionContext, sessionID, hexEncryptionKey string, messages []string) error {
	vault := ctx.Vault

	reqBody := map[string]any{
		"public_key":         vault.PublicKeyECDSA,
		"messages":           messages,
		"session":            sessionID,
		"hex_encryption_key": hexEncryptionKey,
		"derive_path":        deleteDerivePath,
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
