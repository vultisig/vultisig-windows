package tools

import (
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type InitiateSendTool struct{}

func NewInitiateSendTool() *InitiateSendTool {
	return &InitiateSendTool{}
}

func (t *InitiateSendTool) Name() string {
	return "initiate_send"
}

func (t *InitiateSendTool) Description() string {
	return "Opens the send interface with optional prefilled coin, address, amount, and memo. User will review and sign the transaction."
}

func (t *InitiateSendTool) InputSchema() map[string]any {
	return map[string]any{
		"coin": map[string]any{
			"type":        "string",
			"description": "The coin to send (e.g., 'ETH', 'BTC', 'USDC-Ethereum'). Format: TICKER or TICKER-CHAIN for tokens.",
		},
		"address": map[string]any{
			"type":        "string",
			"description": "The recipient address.",
		},
		"amount": map[string]any{
			"type":        "string",
			"description": "The amount to send (as a string, e.g., '0.1', '100').",
		},
		"memo": map[string]any{
			"type":        "string",
			"description": "Optional memo for the transaction.",
		},
	}
}

func (t *InitiateSendTool) RequiresPassword() bool {
	return false
}

func (t *InitiateSendTool) RequiresConfirmation() bool {
	return true
}

func (t *InitiateSendTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	navState := map[string]any{}

	if coinRaw, ok := input["coin"]; ok && coinRaw != nil {
		coinStr := coinRaw.(string)
		coin := parseCoinInputForSend(coinStr)
		if coin != nil {
			navState["coin"] = coin
		}
	}

	if addressRaw, ok := input["address"]; ok && addressRaw != nil {
		navState["address"] = addressRaw.(string)
	}

	if amountRaw, ok := input["amount"]; ok && amountRaw != nil {
		navState["amount"] = amountRaw.(string)
	}

	if memoRaw, ok := input["memo"]; ok && memoRaw != nil {
		navState["memo"] = memoRaw.(string)
	}

	runtime.EventsEmit(ctx.Ctx, "agent:navigate", map[string]any{
		"id":    "send",
		"state": navState,
	})

	result := "Opening send interface"
	if coin, ok := input["coin"]; ok && coin != nil {
		if address, ok := input["address"]; ok && address != nil {
			if amount, ok := input["amount"]; ok && amount != nil {
				result = fmt.Sprintf("Opening send: %v %v to %v", amount, coin, truncateAddress(address.(string)))
			} else {
				result = fmt.Sprintf("Opening send: %v to %v", coin, truncateAddress(address.(string)))
			}
		} else {
			result = fmt.Sprintf("Opening send for %v", coin)
		}
	}

	return map[string]any{
		"success": true,
		"message": result + ". Please review and sign the transaction in the send screen.",
		"navigation": map[string]any{
			"id":    "send",
			"state": navState,
		},
		"ui": map[string]any{
			"title":   "Send Ready",
			"summary": result,
			"actions": []map[string]any{
				{
					"type":  "navigate",
					"label": "Open Send",
					"navigation": map[string]any{
						"id":    "send",
						"state": navState,
					},
				},
			},
		},
	}, nil
}

func parseCoinInputForSend(coinStr string) map[string]any {
	coinStr = strings.TrimSpace(coinStr)
	if coinStr == "" {
		return nil
	}

	parts := strings.Split(coinStr, "-")
	ticker := strings.ToUpper(parts[0])

	chain := ""
	if len(parts) > 1 {
		chain = parts[1]
	} else {
		chain = inferChainFromTicker(ticker)
	}

	if chain == "" {
		return nil
	}

	result := map[string]any{
		"chain": chain,
	}

	if !isNativeCoin(ticker) {
		contractAddr := getTokenContractAddress(ticker, chain)
		if contractAddr != "" {
			result["id"] = contractAddr
		}
	}

	return result
}

func truncateAddress(address string) string {
	if len(address) <= 12 {
		return address
	}
	return address[:6] + "..." + address[len(address)-4:]
}
