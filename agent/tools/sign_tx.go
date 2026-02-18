package tools

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/sirupsen/logrus"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/signing"
	"github.com/vultisig/vultisig-win/agent/toolbridge"
	"github.com/vultisig/vultisig-win/tss"
)

const txDerivePath = "m/44'/60'/0'/0/0"

type SignTxTool struct {
	tss    *tss.TssService
	logger *logrus.Logger
}

func NewSignTxTool(tss *tss.TssService) *SignTxTool {
	return &SignTxTool{
		tss:    tss,
		logger: logrus.WithField("module", "sign_tx").Logger,
	}
}

func (t *SignTxTool) Name() string { return "sign_tx" }

func (t *SignTxTool) Description() string {
	return "Sign and broadcast a bundle of transactions in order."
}

func (t *SignTxTool) InputSchema() map[string]any {
	return map[string]any{
		"chain":        map[string]any{"type": "string", "description": "Chain name"},
		"transactions": map[string]any{"type": "array", "description": "Ordered list of transactions to sign and broadcast"},
	}
}

func (t *SignTxTool) RequiresPassword() bool     { return true }
func (t *SignTxTool) RequiresConfirmation() bool { return false }

func (t *SignTxTool) Execute(input map[string]any, execCtx *ExecutionContext) (any, error) {
	chain, _ := input["chain"].(string)
	conversationID, _ := input["conversation_id"].(string)

	if chain == "" {
		return nil, fmt.Errorf("chain is required")
	}

	txsRaw, ok := input["transactions"].([]any)
	if !ok || len(txsRaw) == 0 {
		return nil, fmt.Errorf("transactions array is required")
	}

	var txHashes []map[string]string

	for i, txRaw := range txsRaw {
		txMap, ok := txRaw.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("transaction %d: invalid format", i)
		}

		txDataMap, ok := txMap["tx_data"].(map[string]any)
		if !ok {
			return nil, fmt.Errorf("transaction %d: tx_data is required", i)
		}

		label, _ := txMap["label"].(string)
		if label == "" {
			label, _ = txMap["type"].(string)
		}

		if execCtx.OnProgress != nil {
			execCtx.OnProgress(fmt.Sprintf("Signing %s transaction...", label))
		}

		signedTx, err := t.signPrebuiltTx(execCtx, chain, txDataMap)
		if err != nil {
			return nil, fmt.Errorf("sign %s tx: %w", label, err)
		}

		hash, err := t.broadcastViaBridge(execCtx, chain, signedTx, conversationID, label)
		if err != nil {
			return nil, fmt.Errorf("broadcast %s tx: %w", label, err)
		}

		t.logger.WithField("tx_hash", hash).WithField("label", label).Info("tx broadcast")
		txHashes = append(txHashes, map[string]string{
			"label":   label,
			"tx_hash": hash,
		})
	}

	result := map[string]any{
		"chain":        chain,
		"transactions": txHashes,
	}
	if len(txHashes) > 0 {
		result["tx_hash"] = txHashes[len(txHashes)-1]["tx_hash"]
	}
	return result, nil
}

func (t *SignTxTool) broadcastViaBridge(execCtx *ExecutionContext, chain string, signedTx []byte, conversationID, label string) (string, error) {
	coins := shared.MapCoinsToToolbridge(execCtx.Vault.Coins)

	req := toolbridge.ToolRequest{
		ToolName: "broadcast_tx",
		Input: map[string]any{
			"chain":           chain,
			"signed_tx_hex":   hex.EncodeToString(signedTx),
			"conversation_id": conversationID,
			"label":           label,
		},
		Context: toolbridge.ToolContext{
			VaultPubKey: execCtx.VaultPubKey,
			VaultName:   execCtx.Vault.Name,
			AuthToken:   execCtx.AuthToken,
			Coins:       coins,
		},
	}

	resp, err := toolbridge.RequestToolExecution(execCtx.AppCtx, execCtx.Ctx, req)
	if err != nil {
		return "", err
	}

	var result map[string]any
	err = json.Unmarshal([]byte(resp.Result), &result)
	if err != nil {
		return "", fmt.Errorf("unmarshal broadcast result: %w", err)
	}

	txHash, _ := result["tx_hash"].(string)
	if txHash == "" {
		return "", fmt.Errorf("no tx_hash in broadcast response")
	}

	return txHash, nil
}

func (t *SignTxTool) signPrebuiltTx(execCtx *ExecutionContext, chain string, txMap map[string]any) ([]byte, error) {
	unsignedTxHex, _ := txMap["unsigned_tx"].(string)
	signingHashHex, _ := txMap["signing_hash"].(string)

	if unsignedTxHex == "" || signingHashHex == "" {
		return nil, fmt.Errorf("unsigned_tx and signing_hash are required")
	}

	err := signing.VerifyTx(chain, unsignedTxHex, signingHashHex)
	if err != nil {
		return nil, fmt.Errorf("verify signing hash: %w", err)
	}

	signingHashClean := strings.TrimPrefix(signingHashHex, "0x")

	cfg := KeysignConfig{
		AppCtx:      execCtx.AppCtx,
		Ctx:         execCtx.Ctx,
		Vault:       execCtx.Vault,
		Password:    execCtx.Password,
		DerivePath:  txDerivePath,
		TSS:         t.tss,
		Logger:      t.logger,
		MaxAttempts: 2,
	}

	signature, err := FastVaultKeysign(cfg, signingHashClean)
	if err != nil {
		return nil, fmt.Errorf("keysign: %w", err)
	}

	rHex, sHex, vHex, err := splitSignature(signature)
	if err != nil {
		return nil, fmt.Errorf("split signature: %w", err)
	}

	signedBytes, err := signing.EncodeSignedTx(chain, unsignedTxHex, rHex, sHex, vHex)
	if err != nil {
		return nil, fmt.Errorf("encode signed tx: %w", err)
	}

	return signedBytes, nil
}

func splitSignature(sigHex string) (rHex, sHex, vHex string, err error) {
	sigHex = strings.TrimPrefix(sigHex, "0x")
	if len(sigHex) != 130 {
		return "", "", "", fmt.Errorf("invalid signature length: %d (expected 130 hex chars)", len(sigHex))
	}

	rHex = sigHex[:64]
	sHex = sigHex[64:128]
	vRaw := sigHex[128:130]

	switch vRaw {
	case "1b":
		vHex = "00"
	case "1c":
		vHex = "01"
	default:
		vHex = vRaw
	}

	return rHex, sHex, vHex, nil
}
