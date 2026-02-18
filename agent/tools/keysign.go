package tools

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"github.com/vultisig/vultisig-win/agent/dklsbridge"
	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

const (
	defaultKeysignPartyTimeout = 2 * time.Minute
	fastVaultSignURL           = "https://api.vultisig.com/vault/sign"
)

type KeysignConfig struct {
	AppCtx      context.Context
	Ctx         context.Context
	Vault       *storage.Vault
	Password    string
	DerivePath  string
	TSS         *tss.TssService
	Logger      *logrus.Logger
	MaxAttempts int
}

func FastVaultKeysign(cfg KeysignConfig, messageHash string) (string, error) {
	vault := cfg.Vault
	if vault == nil {
		return "", fmt.Errorf("vault is required for signing")
	}
	if cfg.Password == "" {
		return "", fmt.Errorf("password is required for signing")
	}

	maxAttempts := cfg.MaxAttempts
	if maxAttempts <= 0 {
		maxAttempts = 2
	}

	logger := cfg.Logger
	if logger == nil {
		logger = logrus.StandardLogger()
	}

	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		sig, err := fastVaultKeysignAttempt(cfg, messageHash, logger)
		if err == nil {
			return sig, nil
		}
		lastErr = err
		if attempt < maxAttempts && isRetryableKeysignError(err) {
			logger.WithError(err).WithField("attempt", attempt).Warn("Keysign failed, retrying with fresh session")
			time.Sleep(2 * time.Second)
			continue
		}
		return "", err
	}
	return "", lastErr
}

func fastVaultKeysignAttempt(cfg KeysignConfig, messageHash string, logger *logrus.Logger) (string, error) {
	vault := cfg.Vault

	sessionID := uuid.New().String()
	encryptionKey := make([]byte, 32)
	_, err := rand.Read(encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to generate encryption key: %w", err)
	}
	hexEncryptionKey := hex.EncodeToString(encryptionKey)

	relayURL := shared.DefaultRelayURL
	relayClient := relay.NewClient(relayURL)

	logger.WithFields(logrus.Fields{
		"session_id": sessionID,
		"relay_url":  relayURL,
	}).Info("Registering session on relay")

	err = relayClient.RegisterSession(sessionID, vault.LocalPartyID)
	if err != nil {
		return "", fmt.Errorf("failed to register session: %w", err)
	}

	logger.Info("Calling Fast Vault Server to start signing")

	err = CallFastVaultSign(cfg.Ctx, vault, cfg.Password, sessionID, hexEncryptionKey, cfg.DerivePath, []string{messageHash})
	if err != nil {
		return "", fmt.Errorf("failed to call fast vault server: %w", err)
	}

	parties, err := WaitForSessionParties(cfg.Ctx, relayClient, sessionID, 2, defaultKeysignPartyTimeout)
	if err != nil {
		return "", fmt.Errorf("failed waiting for parties: %w", err)
	}

	err = relayClient.StartSession(sessionID, parties)
	if err != nil {
		return "", fmt.Errorf("failed to start relay session: %w", err)
	}

	logger.Info("Running TSS keysign protocol")

	if IsDKLSLib(vault.LibType) {
		return dklsKeysign(cfg.AppCtx, cfg.Ctx, vault, messageHash, cfg.DerivePath, sessionID, hexEncryptionKey, relayURL, parties)
	}

	return gg20Keysign(cfg.TSS, vault, messageHash, cfg.DerivePath, sessionID, hexEncryptionKey, relayURL)
}

func isRetryableKeysignError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "timeout waiting for") ||
		strings.Contains(msg, "deadline exceeded") ||
		strings.Contains(msg, "unreachable") ||
		strings.Contains(msg, "dkls keysign failed")
}

func dklsKeysign(appCtx, waitCtx context.Context, vault *storage.Vault, messageHash, derivePath, sessionID, hexEncryptionKey, relayURL string, parties []string) (string, error) {
	keyShare, err := GetECDSAKeyShare(vault)
	if err != nil {
		return "", err
	}

	peers := make([]string, 0, len(parties))
	for _, p := range parties {
		if p != vault.LocalPartyID {
			peers = append(peers, p)
		}
	}

	resp, err := dklsbridge.RequestSign(appCtx, waitCtx, dklsbridge.SignRequest{
		VaultPubKey:        vault.PublicKeyECDSA,
		Message:            messageHash,
		DerivePath:         derivePath,
		SessionID:          sessionID,
		HexEncryptionKey:   hexEncryptionKey,
		RelayURL:           relayURL,
		LocalPartyID:       vault.LocalPartyID,
		Peers:              peers,
		KeyShare:           keyShare,
		SignatureAlgorithm: "ecdsa",
	})
	if err != nil {
		return "", fmt.Errorf("DKLS keysign failed: %w", err)
	}

	recoveryID := resp.RecoveryID
	if recoveryID == "" {
		recoveryID = "1b"
	}
	return signing.FormatSignature(resp.R, resp.S, recoveryID), nil
}

func gg20Keysign(tssService *tss.TssService, vault *storage.Vault, messageHash, derivePath, sessionID, hexEncryptionKey, relayURL string) (string, error) {
	results, err := tssService.Keysign(
		*vault,
		[]string{messageHash},
		vault.LocalPartyID,
		derivePath,
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
	return signing.FormatSignature(hex.EncodeToString(rBytes), hex.EncodeToString(sBytes), recoveryID), nil
}

func CallFastVaultSign(ctx context.Context, vault *storage.Vault, password, sessionID, hexEncryptionKey, derivePath string, messages []string) error {
	reqBody := map[string]any{
		"public_key":         vault.PublicKeyECDSA,
		"messages":           messages,
		"session":            sessionID,
		"hex_encryption_key": hexEncryptionKey,
		"derive_path":        derivePath,
		"is_ecdsa":           true,
		"vault_password":     password,
		"chain":              "Ethereum",
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fastVaultSignURL, bytes.NewReader(jsonBody))
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
		body, _ := io.ReadAll(resp.Body)
		msg := strings.TrimSpace(string(body))
		if msg == "" {
			return fmt.Errorf("fast vault server returned status %d", resp.StatusCode)
		}
		return fmt.Errorf("fast vault server returned status %d: %s", resp.StatusCode, msg)
	}

	return nil
}

func WaitForSessionParties(ctx context.Context, relayClient *relay.Client, sessionID string, expected int, timeout time.Duration) ([]string, error) {
	timer := time.After(timeout)
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-timer:
			return nil, fmt.Errorf("timeout waiting for %d parties", expected)
		case <-ticker.C:
			parties, err := relayClient.GetSession(sessionID)
			if err != nil {
				continue
			}
			if len(parties) >= expected {
				return parties, nil
			}
		}
	}
}

func IsDKLSLib(libType string) bool {
	return strings.EqualFold(strings.TrimSpace(libType), "DKLS")
}

func GetECDSAKeyShare(vault *storage.Vault) (string, error) {
	if vault == nil {
		return "", fmt.Errorf("vault is required")
	}
	for _, ks := range vault.KeyShares {
		if ks.PublicKey == vault.PublicKeyECDSA {
			return ks.KeyShare, nil
		}
	}
	return "", fmt.Errorf("ECDSA keyshare not found for vault %s", vault.PublicKeyECDSA)
}
