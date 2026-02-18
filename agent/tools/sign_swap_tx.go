package tools

import (
	"context"
	"encoding/hex"
	"fmt"
	"math/big"
	"strconv"
	"time"

	"github.com/sirupsen/logrus"

	"github.com/vultisig/vultisig-win/agent/signing"
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
		"from_chain":     map[string]any{"type": "string", "description": "Chain name for RPC URL lookup"},
		"sender":         map[string]any{"type": "string", "description": "Sender address"},
		"swap_tx":        map[string]any{"type": "object", "description": "Swap transaction data"},
		"approval_tx":    map[string]any{"type": "object", "description": "Optional approval transaction data"},
		"needs_approval": map[string]any{"type": "boolean", "description": "Whether approval tx is needed first"},
	}
}

func (t *SignSwapTxTool) RequiresPassword() bool     { return true }
func (t *SignSwapTxTool) RequiresConfirmation() bool { return false }

func (t *SignSwapTxTool) Execute(input map[string]any, execCtx *ExecutionContext) (any, error) {
	fromChain, _ := input["from_chain"].(string)
	sender, _ := input["sender"].(string)
	needsApproval, _ := input["needs_approval"].(bool)

	if fromChain == "" || sender == "" {
		return nil, fmt.Errorf("from_chain and sender are required")
	}

	rpcURL, err := signing.GetEVMRPCURL(fromChain)
	if err != nil {
		return nil, err
	}

	rpcCtx, rpcCancel := context.WithTimeout(execCtx.Ctx, 30*time.Second)
	defer rpcCancel()

	nonce, err := signing.GetNonce(rpcCtx, rpcURL, sender)
	if err != nil {
		return nil, fmt.Errorf("get nonce: %w", err)
	}

	gasPrice, err := signing.GetGasPrice(rpcCtx, rpcURL)
	if err != nil {
		return nil, fmt.Errorf("get gas price: %w", err)
	}

	gasPriceBuffered := new(big.Int).Mul(gasPrice, big.NewInt(110))
	gasPriceBuffered.Div(gasPriceBuffered, big.NewInt(100))

	swapTxMap, ok := input["swap_tx"].(map[string]any)
	if !ok {
		return nil, fmt.Errorf("swap_tx is required")
	}

	var approvalSignedTx []byte

	if needsApproval {
		approvalTxMap, ok := input["approval_tx"].(map[string]any)
		if !ok {
			return nil, fmt.Errorf("approval_tx required when needs_approval is true")
		}

		if execCtx.OnProgress != nil {
			execCtx.OnProgress("Signing approval transaction...")
		}

		approvalParams, err := t.buildTxParams(approvalTxMap, nonce, gasPriceBuffered)
		if err != nil {
			return nil, fmt.Errorf("build approval tx: %w", err)
		}

		approvalSignedTx, err = t.signTx(execCtx, approvalParams)
		if err != nil {
			return nil, fmt.Errorf("sign approval tx: %w", err)
		}

		t.logger.WithField("nonce", nonce).Info("Approval tx signed")
		nonce++
	}

	if execCtx.OnProgress != nil {
		execCtx.OnProgress("Signing swap transaction...")
	}

	swapTxParams, err := t.buildTxParams(swapTxMap, nonce, gasPriceBuffered)
	if err != nil {
		return nil, fmt.Errorf("build swap tx: %w", err)
	}

	swapSignedTx, err := t.signTx(execCtx, swapTxParams)
	if err != nil {
		return nil, fmt.Errorf("sign swap tx: %w", err)
	}

	t.logger.WithField("nonce", nonce).Info("Swap tx signed")

	if execCtx.OnProgress != nil {
		execCtx.OnProgress("Broadcasting transactions...")
	}

	t.logger.WithFields(logrus.Fields{
		"gas_price": gasPriceBuffered.String(),
		"swap_gas_limit": swapTxParams.GasLimit,
		"swap_chain_id":  swapTxParams.ChainID.String(),
		"swap_to":        hex.EncodeToString(swapTxParams.To),
		"swap_value":     swapTxParams.Value.String(),
		"swap_data_len":  len(swapTxParams.Data),
	}).Info("Transaction params")

	var approvalHash string
	if approvalSignedTx != nil {
		broadcastCtx, broadcastCancel := context.WithTimeout(execCtx.Ctx, 30*time.Second)
		approvalHash, err = signing.BroadcastTx(broadcastCtx, rpcURL, approvalSignedTx)
		broadcastCancel()
		if err != nil {
			return nil, fmt.Errorf("broadcast approval tx: %w", err)
		}
		t.logger.WithField("tx_hash", approvalHash).Info("Approval tx broadcast")
	}

	broadcastCtx, broadcastCancel := context.WithTimeout(execCtx.Ctx, 30*time.Second)
	txHash, err := signing.BroadcastTx(broadcastCtx, rpcURL, swapSignedTx)
	broadcastCancel()
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

func (t *SignSwapTxTool) buildTxParams(txMap map[string]any, nonce uint64, gasPrice *big.Int) (*signing.EVMTxParams, error) {
	toAddr, _ := txMap["to"].(string)
	valueStr, _ := txMap["value"].(string)
	dataStr, _ := txMap["data"].(string)
	chainIDStr, _ := txMap["chain_id"].(string)
	gasLimit := extractUint64(txMap, "gas_limit")

	if toAddr == "" {
		return nil, fmt.Errorf("tx 'to' address is required")
	}

	to, err := signing.ParseHexAddress(toAddr)
	if err != nil {
		return nil, fmt.Errorf("parse 'to' address: %w", err)
	}

	value, err := signing.ParseValue(valueStr)
	if err != nil {
		return nil, fmt.Errorf("parse value: %w", err)
	}

	data, err := signing.ParseHexData(dataStr)
	if err != nil {
		return nil, fmt.Errorf("parse data: %w", err)
	}

	chainID := big.NewInt(1)
	if chainIDStr != "" {
		parsed, parseErr := strconv.ParseInt(chainIDStr, 10, 64)
		if parseErr != nil {
			return nil, fmt.Errorf("parse chain_id: %w", parseErr)
		}
		chainID = big.NewInt(parsed)
	}

	if gasLimit == 0 {
		gasLimit = 300000
	}

	return &signing.EVMTxParams{
		Nonce:    nonce,
		GasPrice: gasPrice,
		GasLimit: gasLimit,
		To:       to,
		Value:    value,
		Data:     data,
		ChainID:  chainID,
	}, nil
}

func (t *SignSwapTxTool) signTx(execCtx *ExecutionContext, txParams *signing.EVMTxParams) ([]byte, error) {
	signingHash := signing.ComputeSigningHash(txParams)
	signingHashHex := hex.EncodeToString(signingHash)

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

	signature, err := FastVaultKeysign(cfg, signingHashHex)
	if err != nil {
		return nil, fmt.Errorf("keysign: %w", err)
	}

	v, r, s, err := signing.ParseSignature(signature, txParams.ChainID)
	if err != nil {
		return nil, fmt.Errorf("parse signature: %w", err)
	}

	return signing.EncodeSignedTx(txParams, v, r, s), nil
}

func extractUint64(params map[string]any, key string) uint64 {
	v, ok := params[key]
	if !ok {
		return 0
	}
	switch n := v.(type) {
	case float64:
		return uint64(n)
	case int:
		return uint64(n)
	case uint64:
		return n
	case string:
		parsed, err := strconv.ParseUint(n, 10, 64)
		if err != nil {
			return 0
		}
		return parsed
	}
	return 0
}
