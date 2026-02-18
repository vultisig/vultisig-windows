package tools

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"github.com/vultisig/vultisig-win/agent/dklsbridge"
	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/verifier"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
)

const (
	fastVaultServerURLInstall = "https://api.vultisig.com"
	pluginInstallJoinTimeout = 5 * time.Minute

	pluginPeersMinimumJoinedParties = 3
	libTypeGG20                     = 0
	libTypeDKLS                     = 1
	libTypeKeyImport                = 2
)

var pluginPartyIDPattern = regexp.MustCompile(`^[^-]+-[^-]+-[0-9a-f]{4}-[0-9]+$`)

type PluginInstallTool struct {
	client *verifier.Client
	store  *storage.Store
	logger *logrus.Logger
}

func NewPluginInstallTool(client *verifier.Client, store *storage.Store) *PluginInstallTool {
	return &PluginInstallTool{
		client: client,
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
	emitProgress := func(step string) {
		if ctx.OnProgress != nil {
			ctx.OnProgress(step)
		}
	}

	pluginIDRaw, ok := input["plugin_id"]
	if !ok {
		return nil, fmt.Errorf("plugin_id is required")
	}

	pluginIDStr, ok := pluginIDRaw.(string)
	if !ok {
		return nil, fmt.Errorf("plugin_id must be a string")
	}
	pluginID := shared.ResolvePluginID(pluginIDStr)
	pluginName := shared.GetPluginName(pluginID)
	addLog(fmt.Sprintf("Resolved plugin: %s (%s)", pluginName, pluginID))

	addLog("Checking if plugin is already installed...")
	installed, err := t.client.CheckPluginInstalled(pluginID, ctx.VaultPubKey, ctx.AuthToken)
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
	emitProgress("5% Preparing plugin installation...")

	installLog, err := t.reshareWithPlugin(ctx, pluginID, emitProgress)
	debugLog = append(debugLog, installLog...)
	if err != nil {
		return map[string]any{
			"success":   false,
			"error":     err.Error(),
			"debug_log": debugLog,
		}, fmt.Errorf("failed to install plugin: %w", err)
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

func (t *PluginInstallTool) reshareWithPlugin(ctx *ExecutionContext, pluginID string, emitProgress func(string)) ([]string, error) {
	debugLog := []string{}
	addLog := func(msg string) {
		debugLog = append(debugLog, msg)
		t.logger.Info(msg)
	}

	if ctx.Vault == nil {
		return debugLog, fmt.Errorf("vault is required")
	}
	if ctx.Password == "" {
		return debugLog, fmt.Errorf("password is required")
	}
	if ctx.AuthToken == "" {
		return debugLog, fmt.Errorf("auth token is required for plugin installation")
	}

	vault := ctx.Vault
	err := validateVaultForPluginInstall(vault)
	if err != nil {
		return debugLog, err
	}
	if !slices.Contains(vault.Signers, vault.LocalPartyID) {
		return debugLog, fmt.Errorf("local party id %q is not in vault signers %v; cannot start plugin install reshare", vault.LocalPartyID, vault.Signers)
	}
	addLog(fmt.Sprintf("Vault local party: %s", vault.LocalPartyID))
	addLog(fmt.Sprintf("Vault old signers (%d): %v", len(vault.Signers), vault.Signers))

	sessionID := uuid.New().String()
	encryptionKey := make([]byte, 32)
	_, err = rand.Read(encryptionKey)
	if err != nil {
		return debugLog, fmt.Errorf("failed to generate encryption key: %w", err)
	}
	hexEncryptionKey := hex.EncodeToString(encryptionKey)

	relayURL := shared.DefaultRelayURL
	relayClient := relay.NewClient(relayURL)

	addLog(fmt.Sprintf("Session ID: %s", sessionID))
	addLog(fmt.Sprintf("Relay URL: %s", relayURL))
	emitProgress("15% Registering session on relay...")
	addLog("Registering session on relay...")

	err = relayClient.RegisterSession(sessionID, vault.LocalPartyID)
	if err != nil {
		return debugLog, fmt.Errorf("failed to register session: %w", err)
	}
	addLog("Session registered successfully")

	emitProgress("25% Waiting for Fast Vault Server to join...")
	addLog("Requesting Fast Vault Server to join reshare...")
	err = t.requestFastVaultReshare(ctx, sessionID, hexEncryptionKey)
	if err != nil {
		addLog(fmt.Sprintf("Warning: Fast Vault Server request failed: %v", err))
	}
	addLog("Waiting for Fast Vault Server to join before requesting Verifier...")
	if _, err := waitForSessionPartiesWithProgress(ctx.Ctx, relayClient, sessionID, 2, addLog, "fast-vault"); err != nil {
		return debugLog, fmt.Errorf("fast vault did not join: %w", err)
	}
	addLog("Fast Vault Server joined successfully")

	emitProgress("40% Waiting for Verifier to join...")
	verifierURL := shared.GetVerifierURL()
	addLog(fmt.Sprintf("Requesting Verifier to join reshare (plugin: %s)...", pluginID))
	addLog(fmt.Sprintf("Verifier URL: %s", verifierURL))
	addLog(fmt.Sprintf("Auth token has bearer prefix: %v", strings.HasPrefix(strings.ToLower(strings.TrimSpace(ctx.AuthToken)), "bearer ")))
	err = t.requestVerifierReshare(ctx, sessionID, hexEncryptionKey, pluginID, verifierURL)
	if err != nil {
		return debugLog, fmt.Errorf("failed to request verifier reshare: %w", err)
	}
	addLog("Verifier joined successfully")

	emitProgress("55% Waiting for plugin server to join...")
	expectedParties := len(vault.Signers) + 2
	addLog(fmt.Sprintf("Waiting for plugin-install peers to be ready (expected>=%d)...", expectedParties))
	parties, err := waitForPluginInstallPartiesWithProgress(ctx.Ctx, relayClient, sessionID, expectedParties, addLog)
	if err != nil {
		currentParties, getErr := relayClient.GetSession(sessionID)
		if getErr != nil {
			return debugLog, fmt.Errorf("failed waiting for parties: %w (also failed reading current session parties: %v)", err, getErr)
		}
		return debugLog, fmt.Errorf("failed waiting for parties: %w (expected=%d, current=%d, parties=%v)", err, expectedParties, len(currentParties), currentParties)
	}
	addLog(fmt.Sprintf("Session parties: %v", parties))

	emitProgress("70% All peers joined, starting MPC session...")
	addLog("Starting relay session...")
	err = relayClient.StartSession(sessionID, parties)
	if err != nil {
		return debugLog, fmt.Errorf("failed to start relay session: %w", err)
	}
	addLog("Relay session started")

	emitProgress("80% Running key reshare protocol...")
	addLog("Running DKLS reshare protocol...")

	var ecdsaKeyshare, eddsaKeyshare string
	for _, ks := range vault.KeyShares {
		if ks.PublicKey == vault.PublicKeyECDSA {
			ecdsaKeyshare = ks.KeyShare
		}
		if ks.PublicKey == vault.PublicKeyEdDSA {
			eddsaKeyshare = ks.KeyShare
		}
	}

	reshareReq := dklsbridge.ReshareRequest{
		VaultPubKey:      vault.PublicKeyECDSA,
		SessionID:        sessionID,
		HexEncryptionKey: hexEncryptionKey,
		RelayURL:         relayURL,
		LocalPartyID:     vault.LocalPartyID,
		Peers:            parties,
		OldParties:       vault.Signers,
		EcdsaKeyshare:    ecdsaKeyshare,
		EddsaKeyshare:    eddsaKeyshare,
	}

	_, err = dklsbridge.RequestReshare(ctx.AppCtx, ctx.Ctx, reshareReq)
	if err != nil {
		addLog(fmt.Sprintf("DKLS reshare failed: %v", err))
		return debugLog, fmt.Errorf("reshare failed: %w", err)
	}

	emitProgress("95% Verifying installation...")
	addLog("TSS reshare completed successfully")

	var confirmed bool
	for i := 0; i < 5; i++ {
		confirmed, err = t.client.CheckPluginInstalled(pluginID, vault.PublicKeyECDSA, ctx.AuthToken)
		if err != nil {
			addLog(fmt.Sprintf("Install verification attempt %d failed: %v", i+1, err))
		}
		if confirmed {
			break
		}
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		return debugLog, fmt.Errorf("plugin install reshare completed but failed to confirm backend install state: %w", err)
	}
	if !confirmed {
		return debugLog, fmt.Errorf("plugin install reshare completed but backend still reports plugin as not installed")
	}
	return debugLog, nil
}

func waitForSessionPartiesWithProgress(
	ctx context.Context,
	relayClient *relay.Client,
	sessionID string,
	expected int,
	addLog func(string),
	label string,
) ([]string, error) {
	timeout := time.After(pluginInstallJoinTimeout)
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	lastCount := -1
	lastLogAt := time.Now().Add(-30 * time.Second)
	lastParties := []string{}

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-timeout:
			return nil, fmt.Errorf("timeout waiting for %d parties after %s (last=%d, parties=%v)", expected, pluginInstallJoinTimeout, len(lastParties), lastParties)
		case <-ticker.C:
			parties, err := relayClient.GetSession(sessionID)
			if err != nil {
				continue
			}
			lastParties = parties

			now := time.Now()
			if len(parties) != lastCount || now.Sub(lastLogAt) >= 15*time.Second {
				addLog(fmt.Sprintf("[%s] session parties: %d/%d %v", label, len(parties), expected, parties))
				lastCount = len(parties)
				lastLogAt = now
			}
			if len(parties) >= expected {
				return parties, nil
			}
		}
	}
}

func waitForPluginInstallPartiesWithProgress(
	ctx context.Context,
	relayClient *relay.Client,
	sessionID string,
	expected int,
	addLog func(string),
) ([]string, error) {
	timeout := time.After(pluginInstallJoinTimeout)
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	requiredPeers := expected
	if requiredPeers < pluginPeersMinimumJoinedParties {
		requiredPeers = pluginPeersMinimumJoinedParties
	}

	lastCount := -1
	lastLogAt := time.Now().Add(-30 * time.Second)
	lastParties := []string{}

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-timeout:
			return nil, fmt.Errorf(
				"timeout waiting for plugin-install peers after %s (required=%d, last=%d, parties=%v)",
				pluginInstallJoinTimeout,
				requiredPeers,
				len(lastParties),
				lastParties,
			)
		case <-ticker.C:
			parties, err := relayClient.GetSession(sessionID)
			if err != nil {
				continue
			}
			lastParties = parties

			hasServer, hasVerifier, hasPlugin := classifyPluginInstallParties(parties)
			ready := hasServer && hasVerifier && hasPlugin && len(parties) >= requiredPeers

			now := time.Now()
			if len(parties) != lastCount || now.Sub(lastLogAt) >= 15*time.Second {
				addLog(fmt.Sprintf(
					"[plugin-peers] parties=%d/%d server=%t verifier=%t plugin=%t %v",
					len(parties),
					requiredPeers,
					hasServer,
					hasVerifier,
					hasPlugin,
					parties,
				))
				lastCount = len(parties)
				lastLogAt = now
			}

			if ready {
				return parties, nil
			}
		}
	}
}

func classifyPluginInstallParties(parties []string) (hasServer, hasVerifier, hasPlugin bool) {
	for _, party := range parties {
		partyLower := strings.ToLower(strings.TrimSpace(party))
		if strings.HasPrefix(partyLower, "server-") {
			hasServer = true
		}
		if strings.HasPrefix(partyLower, "verifier") {
			hasVerifier = true
		}
		if pluginPartyIDPattern.MatchString(party) {
			hasPlugin = true
		}
	}
	return
}

func validateVaultForPluginInstall(vault *storage.Vault) error {
	if vault == nil {
		return fmt.Errorf("vault is required")
	}
	if strings.TrimSpace(vault.PublicKeyECDSA) == "" {
		return fmt.Errorf("vault ECDSA public key is required")
	}
	if strings.TrimSpace(vault.HexChainCode) == "" {
		return fmt.Errorf("vault hex chain code is required")
	}
	if !hasServerParty(vault.Signers) {
		return fmt.Errorf("plugin installation requires a fast vault signer committee with a server party")
	}
	if !IsDKLSLib(vault.LibType) {
		return fmt.Errorf("plugin installation requires a DKLS vault; GG20 vaults are not supported")
	}
	return nil
}

func hasServerParty(parties []string) bool {
	for _, party := range parties {
		if strings.HasPrefix(strings.ToLower(strings.TrimSpace(party)), "server-") {
			return true
		}
	}
	return false
}

func toLibType(vault *storage.Vault) int {
	if vault == nil {
		return libTypeGG20
	}
	if len(vault.ChainPublicKeys) > 0 || len(vault.ChainKeyShares) > 0 {
		return libTypeKeyImport
	}
	libType := strings.ToUpper(strings.TrimSpace(vault.LibType))
	switch libType {
	case "DKLS":
		return libTypeDKLS
	case "KEYIMPORT":
		return libTypeKeyImport
	default:
		return libTypeGG20
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
	libType := toLibType(vault)

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
		"lib_type":            libType,
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
		"old_reshare_prefix": vault.ResharePrefix,
		"lib_type":           toLibType(vault),
		"email":              "",
		"plugin_id":          pluginID,
		"use_vultisig_relay": true,
		"relay_url":          shared.DefaultRelayURL,
		"relay_server":       shared.DefaultRelayURL,
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
		req.Header.Set("Authorization", shared.BearerAuth(ctx.AuthToken))
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

