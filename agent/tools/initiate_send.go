package tools

import (
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/agent/shared"
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
			"description": "The recipient blockchain address. Must be a valid address (e.g., 0x... for EVM, bc1... for Bitcoin). If the user provides a name or vault name instead of an address, use list_vaults or get_address_book to resolve it first.",
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
	return false
}

func (t *InitiateSendTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if addressRaw, ok := input["address"]; ok && addressRaw != nil {
		if addr, ok := addressRaw.(string); ok {
			addr = strings.TrimSpace(addr)
			if addr != "" && !looksLikeAddress(addr) {
				return nil, fmt.Errorf("%q does not look like a valid blockchain address. If this is a vault name or contact, please look up the actual address first", addr)
			}
		}
	}

	navState := map[string]any{}

	if coinRaw, ok := input["coin"]; ok && coinRaw != nil {
		if coinStr, ok := coinRaw.(string); ok {
			coin := parseCoinInputForSend(coinStr)
			if coin != nil {
				navState["coin"] = coin
			}
		}
	}

	if addressRaw, ok := input["address"]; ok && addressRaw != nil {
		if addr, ok := addressRaw.(string); ok {
			navState["address"] = addr
		}
	}

	if amountRaw, ok := input["amount"]; ok && amountRaw != nil {
		amountStr := strings.TrimSpace(fmt.Sprintf("%v", amountRaw))
		if amountStr != "" {
			if coinMap, ok := navState["coin"].(map[string]any); ok {
				chain, _ := coinMap["chain"].(string)
				tokenAddr, _ := coinMap["id"].(string)
				decimals := shared.ResolveDecimalsByChainAndToken(chain, tokenAddr)
				amountStr = convertToSmallestUnit(amountStr, decimals)
			}
			navState["amount"] = amountStr
		}
	}

	if memoRaw, ok := input["memo"]; ok && memoRaw != nil {
		if memo, ok := memoRaw.(string); ok {
			navState["memo"] = memo
		}
	}

	runtime.EventsEmit(ctx.AppCtx, "agent:navigate", map[string]any{
		"id":    "send",
		"state": navState,
	})

	result := "Opening send interface"
	if coin, ok := input["coin"]; ok && coin != nil {
		if address, ok := input["address"]; ok && address != nil {
			addrStr, _ := address.(string)
			if amount, ok := input["amount"]; ok && amount != nil {
				result = fmt.Sprintf("Opening send: %v %v to %v", amount, coin, truncateAddress(addrStr))
			} else {
				result = fmt.Sprintf("Opening send: %v to %v", coin, truncateAddress(addrStr))
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

func looksLikeAddress(s string) bool {
	if len(s) < 20 {
		return false
	}
	if strings.HasPrefix(s, "0x") || strings.HasPrefix(s, "0X") {
		return len(s) >= 42
	}
	if strings.HasPrefix(s, "bc1") || strings.HasPrefix(s, "tb1") {
		return true
	}
	if strings.HasPrefix(s, "T") && len(s) == 34 {
		return true
	}
	if strings.Contains(s, " ") {
		return false
	}
	return len(s) >= 25
}
