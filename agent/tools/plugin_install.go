package tools

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

const (
	fastVaultServerURLInstall = "https://api.vultisig.com"
)

type PluginInstallTool struct {
	client *verifier.Client
	tss    *tss.TssService
	store  *storage.Store
	logger *logrus.Logger
}

func NewPluginInstallTool(client *verifier.Client, tss *tss.TssService, store *storage.Store) *PluginInstallTool {
	return &PluginInstallTool{
		client: client,
		tss:    tss,
		store:  store,
		logger: logrus.WithField("module", "plugin_install").Logger,
	}
}

func (t *PluginInstallTool) Name() string {
	return "plugin_install"
}

func (t *PluginInstallTool) Description() string {
	return "Install a plugin for the vault by resharing the key with the plugin server. This is required before adding policies."
}

func (t *PluginInstallTool) InputSchema() map[string]any {
	return map[string]any{
		"plugin_id": map[string]any{
			"type":        "string",
			"description": "The plugin ID or alias (e.g., 'dca', 'sends')",
		},
	}
}

func (t *PluginInstallTool) RequiresPassword() bool {
	return true
}

func (t *PluginInstallTool) RequiresConfirmation() bool {
	return true
}

func (t *PluginInstallTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	debugLog := []string{}
	addLog := func(msg string) {
		debugLog = append(debugLog, msg)
		t.logger.Info(msg)
	}

	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginID := shared.ResolvePluginID(pluginIDRaw.(string))
	pluginName := shared.GetPluginName(pluginID)
	addLog(fmt.Sprintf("Resolved plugin: %s (%s)", pluginName, pluginID))

	addLog("Checking if plugin is already installed...")
	installed, err := t.client.CheckPluginInstalled(pluginID, ctx.VaultPubKey)
	if err != nil {
		addLog(fmt.Sprintf("Warning: Failed to check installation status: %v", err))
	}

	if installed {
		return map[string]any{
			"success":           true,
			"plugin_id":         pluginID,
			"plugin_name":       pluginName,
			"message":           fmt.Sprintf("Plugin %s is already installed for this vault.", pluginName),
			"already_installed": true,
			"debug_log":         debugLog,
		}, nil
	}

	addLog("Plugin not installed, starting installation...")
	addLog(fmt.Sprintf("Auth token present: %v", ctx.AuthToken != ""))
	addLog(fmt.Sprintf("Password present: %v", ctx.Password != ""))

	newVault, installLog, err := t.reshareWithPlugin(ctx, pluginID)
	debugLog = append(debugLog, installLog...)
	if err != nil {
		return map[string]any{
			"success":   false,
			"error":     err.Error(),
			"debug_log": debugLog,
		}, fmt.Errorf("failed to install plugin: %w", err)
	}

	addLog("Saving updated vault...")
	err = t.store.SaveVault(newVault)
	if err != nil {
		return map[string]any{
			"success":   false,
			"error":     err.Error(),
			"debug_log": debugLog,
		}, fmt.Errorf("failed to save updated vault: %w", err)
	}

	addLog("Plugin installed successfully!")
	return map[string]any{
		"success":     true,
		"plugin_id":   pluginID,
		"plugin_name": pluginName,
		"message":     fmt.Sprintf("Plugin %s installed successfully! You can now add policies.", pluginName),
		"debug_log":   debugLog,
	}, nil
}

func (t *PluginInstallTool) reshareWithPlugin(ctx *ExecutionContext, pluginID string) (*storage.Vault, []string, error) {
	debugLog := []string{}
	addLog := func(msg string) {
		debugLog = append(debugLog, msg)
		t.logger.Info(msg)
	}

	if ctx.Vault == nil {
		return nil, debugLog, fmt.Errorf("vault is required")
	}
	if ctx.Password == "" {
		return nil, debugLog, fmt.Errorf("password is required")
	}
	if ctx.AuthToken == "" {
		return nil, debugLog, fmt.Errorf("auth token is required for plugin installation")
	}

	vault := ctx.Vault

	sessionID := uuid.New().String()
	encryptionKey := make([]byte, 32)
	_, err := rand.Read(encryptionKey)
	if err != nil {
		return nil, debugLog, fmt.Errorf("failed to generate encryption key: %w", err)
	}
	hexEncryptionKey := hex.EncodeToString(encryptionKey)

	relayURL := shared.DefaultRelayURL
	relayClient := relay.NewClient(relayURL)

	addLog(fmt.Sprintf("Session ID: %s", sessionID))
	addLog(fmt.Sprintf("Relay URL: %s", relayURL))
	addLog("Registering session on relay...")

	err = relayClient.RegisterSession(sessionID, vault.LocalPartyID)
	if err != nil {
		return nil, debugLog, fmt.Errorf("failed to register session: %w", err)
	}
	addLog("Session registered successfully")

	addLog("Requesting Fast Vault Server to join reshare...")
	err = t.requestFastVaultReshare(ctx, sessionID, hexEncryptionKey)
	if err != nil {
		addLog(fmt.Sprintf("Warning: Fast Vault Server request failed: %v", err))
	} else {
		addLog("Fast Vault Server joined successfully")
	}

	verifierURL := shared.GetVerifierURL()
	addLog(fmt.Sprintf("Requesting Verifier to join reshare (plugin: %s)...", pluginID))
	addLog(fmt.Sprintf("Verifier URL: %s", verifierURL))
	err = t.requestVerifierReshare(ctx, sessionID, hexEncryptionKey, pluginID, verifierURL)
	if err != nil {
		return nil, debugLog, fmt.Errorf("failed to request verifier reshare: %w", err)
	}
	addLog("Verifier joined successfully")

	addLog("Running TSS reshare protocol...")

	type reshareResult struct {
		vault *storage.Vault
		err   error
	}
	resultCh := make(chan reshareResult, 1)

	go func() {
		newVault, err := t.tss.Reshare(*vault, sessionID, hexEncryptionKey, relayURL)
		resultCh <- reshareResult{vault: newVault, err: err}
	}()

	select {
	case result := <-resultCh:
		if result.err != nil {
			addLog(fmt.Sprintf("TSS reshare failed: %v", result.err))
			return nil, debugLog, fmt.Errorf("reshare failed: %w", result.err)
		}
		addLog("TSS reshare completed successfully")
		return result.vault, debugLog, nil
	case <-ctx.Ctx.Done():
		addLog("TSS reshare timed out or cancelled")
		return nil, debugLog, fmt.Errorf("reshare timed out or cancelled: %w", ctx.Ctx.Err())
	case <-time.After(90 * time.Second):
		addLog("TSS reshare timed out after 90 seconds")
		return nil, debugLog, fmt.Errorf("reshare timed out after 90 seconds - ensure Fast Vault Server and Verifier are running")
	}
}

func generateServerPartyID(sessionID string) string {
	h := 0
	for _, c := range sessionID {
		h = 31*h + int(c)
	}
	if h < 0 {
		h = -h
	}
	suffix := fmt.Sprintf("%d", h)
	if len(suffix) > 5 {
		suffix = suffix[len(suffix)-5:]
	}
	return fmt.Sprintf("Server-%s", suffix)
}

func (t *PluginInstallTool) requestFastVaultReshare(ctx *ExecutionContext, sessionID, hexEncryptionKey string) error {
	vault := ctx.Vault
	serverPartyID := generateServerPartyID(sessionID)

	reqBody := map[string]any{
		"name":                vault.Name,
		"public_key":          vault.PublicKeyECDSA,
		"session_id":          sessionID,
		"hex_encryption_key":  hexEncryptionKey,
		"hex_chain_code":      vault.HexChainCode,
		"local_party_id":      serverPartyID,
		"old_parties":         vault.Signers,
		"old_reshare_prefix":  vault.ResharePrefix,
		"encryption_password": ctx.Password,
		"email":               "",
		"reshare_type":        1,
		"lib_type":            1,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	reshareURL := fastVaultServerURLInstall + "/vault/reshare"
	t.logger.WithField("url", reshareURL).Info("Sending reshare request to Fast Vault Server")

	req, err := http.NewRequestWithContext(ctx.Ctx, http.MethodPost, reshareURL, bytes.NewReader(jsonBody))
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

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("fast vault server returned %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

func (t *PluginInstallTool) requestVerifierReshare(ctx *ExecutionContext, sessionID, hexEncryptionKey, pluginID, verifierURL string) error {
	vault := ctx.Vault

	reqBody := map[string]any{
		"name":               vault.Name,
		"public_key":         vault.PublicKeyECDSA,
		"session_id":         sessionID,
		"hex_encryption_key": hexEncryptionKey,
		"hex_chain_code":     vault.HexChainCode,
		"local_party_id":     "verifier-" + sessionID[:8],
		"old_parties":        vault.Signers,
		"email":              "",
		"plugin_id":          pluginID,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	reshareURL := verifierURL + "/vault/reshare"
	t.logger.WithField("url", reshareURL).Info("Sending reshare request to Verifier")

	req, err := http.NewRequestWithContext(ctx.Ctx, http.MethodPost, reshareURL, bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if ctx.AuthToken != "" {
		req.Header.Set("Authorization", "Bearer "+ctx.AuthToken)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("verifier returned %d: %s", resp.StatusCode, string(body))
	}

	return nil
}
