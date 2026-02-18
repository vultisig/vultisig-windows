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

const swapDerivePath = "m/44'/60'/0'/0/0"

type SignSwapTxTool struct {
	tss    *tss.TssService
	logger *logrus.Logger
}

func NewSignSwapTxTool(tss *tss.TssService) *SignSwapTxTool {
	return &SignSwapTxTool{
		tss:    tss,
		logger: logrus.WithField("module", "sign_swap_tx").Logger,
	}
}

func (t *SignSwapTxTool) Name() string { return "sign_swap_tx" }

func (t *SignSwapTxTool) Description() string {
	return "Sign and broadcast a swap transaction built by the DCA plugin."
}

func (t *SignSwapTxTool) InputSchema() map[string]any {
	return map[string]any{
		"from_chain":     map[string]any{"type": "string", "description": "Chain name"},
		"swap_tx":        map[string]any{"type": "object", "description": "Swap transaction data"},
		"approval_tx":    map[string]any{"type": "object", "description": "Optional approval transaction data"},
		"needs_approval": map[string]any{"type": "boolean", "description": "Whether approval tx is needed first"},
	}
}

func (t *SignSwapTxTool) RequiresPassword() bool     { return true }
func (t *SignSwapTxTool) RequiresConfirmation() bool { return false }

func (t *SignSwapTxTool) Execute(input map[string]any, execCtx *ExecutionContext) (any, error) {
	fromChain, _ := input["from_chain"].(string)
	needsApproval, _ := input["needs_approval"].(bool)
	conversationID, _ := input["conversation_id"].(string)

	if fromChain == "" {
		return nil, fmt.Errorf("from_chain is required")
	}

	swapTxMap, ok := input["swap_tx"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("swap_tx is required")
	}

	var approvalHash string

	if needsApproval {
		approvalTxMap, ok := input["approval_tx"].(map[string]any)
		if !ok {
			return nil, fmt.Errorf("approval_tx required when needs_approval is true")
		}

		if execCtx.OnProgress != nil {
			execCtx.OnProgress("Signing approval transaction...")
		}

		signedApproval, err := t.signPrebuiltTx(execCtx, fromChain, approvalTxMap)
		if err != nil {
			return nil, fmt.Errorf("sign approval tx: %w", err)
		}

		hash, err := t.broadcastViaBridge(execCtx, fromChain, signedApproval, conversationID, "Approval")
		if err != nil {
			return nil, fmt.Errorf("broadcast approval tx: %w", err)
		}
		approvalHash = hash
		t.logger.WithField("tx_hash", approvalHash).Info("Approval tx broadcast")
	}

	if execCtx.OnProgress != nil {
		execCtx.OnProgress("Signing swap transaction...")
	}

	signedSwap, err := t.signPrebuiltTx(execCtx, fromChain, swapTxMap)
	if err != nil {
		return nil, fmt.Errorf("sign swap tx: %w", err)
	}

	if execCtx.OnProgress != nil {
		execCtx.OnProgress("Broadcasting transactions...")
	}

	txHash, err := t.broadcastViaBridge(execCtx, fromChain, signedSwap, conversationID, "Swap")
	if err != nil {
		return nil, fmt.Errorf("broadcast swap tx: %w", err)
	}

	t.logger.WithField("tx_hash", txHash).Info("Swap tx broadcast")

	result := map[string]any{
		"tx_hash": txHash,
		"chain":   fromChain,
	}
	if approvalHash != "" {
		result["approval_tx_hash"] = approvalHash
	}
	return result, nil
}

func (t *SignSwapTxTool) broadcastViaBridge(execCtx *ExecutionContext, chain string, signedTx []byte, conversationID, label string) (string, error) {
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

func (t *SignSwapTxTool) signPrebuiltTx(execCtx *ExecutionContext, chain string, txMap map[string]any) ([]byte, error) {
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
		DerivePath:  swapDerivePath,
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
