package tools

import (
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type InitiateSwapTool struct{}

func NewInitiateSwapTool() *InitiateSwapTool {
	return &InitiateSwapTool{}
}

func (t *InitiateSwapTool) Name() string {
	return "initiate_swap"
}

func (t *InitiateSwapTool) Description() string {
	return "Opens the swap interface with optional prefilled from/to coins. User will review and sign the transaction."
}

func (t *InitiateSwapTool) InputSchema() map[string]any {
	return map[string]any{
		"from_coin": map[string]any{
			"type":        "string",
			"description": "The coin to swap from (e.g., 'ETH', 'BTC', 'USDC-Ethereum'). Format: TICKER or TICKER-CHAIN for tokens.",
		},
		"to_coin": map[string]any{
			"type":        "string",
			"description": "The coin to swap to (e.g., 'USDC', 'ETH', 'USDT-Ethereum'). Format: TICKER or TICKER-CHAIN for tokens.",
		},
	}
}

func (t *InitiateSwapTool) RequiresPassword() bool {
	return false
}

func (t *InitiateSwapTool) RequiresConfirmation() bool {
	return true
}

func (t *InitiateSwapTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	var fromCoin, toCoin map[string]any

	if fromCoinRaw, ok := input["from_coin"]; ok && fromCoinRaw != nil {
		fromStr, ok := fromCoinRaw.(string)
		if ok {
			fromCoin = parseCoinInput(fromStr)
		}
	}

	if toCoinRaw, ok := input["to_coin"]; ok && toCoinRaw != nil {
		toStr, ok := toCoinRaw.(string)
		if ok {
			toCoin = parseCoinInput(toStr)
		}
	}

	navState := map[string]any{}
	if fromCoin != nil {
		navState["fromCoin"] = fromCoin
	}
	if toCoin != nil {
		navState["toCoin"] = toCoin
	}

	runtime.EventsEmit(ctx.Ctx, "agent:navigate", map[string]any{
		"id":    "swap",
		"state": navState,
	})

	result := "Opening swap interface"
	if fromCoin != nil && toCoin != nil {
		result = fmt.Sprintf("Opening swap: %v → %v", input["from_coin"], input["to_coin"])
	} else if fromCoin != nil {
		result = fmt.Sprintf("Opening swap from %v", input["from_coin"])
	}

	return map[string]any{
		"success": true,
		"message": result + ". Please review and sign the transaction in the swap screen.",
		"navigation": map[string]any{
			"id":    "swap",
			"state": navState,
		},
		"ui": map[string]any{
			"title":   "Swap Ready",
			"summary": result,
			"actions": []map[string]any{
				{
					"type":  "navigate",
					"label": "Open Swap",
					"navigation": map[string]any{
						"id":    "swap",
						"state": navState,
					},
				},
			},
		},
	}, nil
}

func parseCoinInput(coinStr string) map[string]any {
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

func isNativeCoin(ticker string) bool {
	nativeCoins := map[string]bool{
		"BTC":   true,
		"ETH":   true,
		"SOL":   true,
		"ATOM":  true,
		"RUNE":  true,
		"CACAO": true,
		"DOGE":  true,
		"LTC":   true,
		"BCH":   true,
		"AVAX":  true,
		"BNB":   true,
		"MATIC": true,
		"ARB":   true,
		"OP":    true,
		"SUI":   true,
		"DOT":   true,
		"XRP":   true,
		"TON":   true,
		"TRX":   true,
		"DASH":  true,
	}
	return nativeCoins[ticker]
}

func getTokenContractAddress(ticker, chain string) string {
	// Map of chain -> ticker -> contract address
	tokenAddresses := map[string]map[string]string{
		"Ethereum": {
			"USDC":  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			"USDT":  "0xdac17f958d2ee523a2206206994597c13d831ec7",
			"DAI":   "0x6b175474e89094c44da98b954eedeac495271d0f",
			"WETH":  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
			"WBTC":  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
			"LINK":  "0x514910771af9ca656af840dff83e8264ecf986ca",
			"UNI":   "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
			"AAVE":  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
			"COMP":  "0xc00e94cb662c3520282e6f5717214004a7f26888",
			"MKR":   "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
			"SNX":   "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
			"SUSHI": "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
			"YFI":   "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
			"GRT":   "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
			"PEPE":  "0x6982508145454ce325ddbe47a25d4ec3d2311933",
			"VULT":  "0xb788144DF611029C60b859DF47e79B7726C4DEBa",
		},
		"Arbitrum": {
			"USDC": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
			"USDT": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
			"DAI":  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
			"WBTC": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
			"LINK": "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
			"UNI":  "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
			"GRT":  "0x9623063377AD1B27544C965cCd7342f7EA7e88C7",
			"PEPE": "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
			"ARB":  "0x912ce59144191c1204e64559fe8253a0e49e6548",
		},
		"Optimism": {
			"USDC": "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
			"USDT": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
			"DAI":  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
			"WBTC": "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
			"LINK": "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
			"OP":   "0x4200000000000000000000000000000000000042",
		},
		"Polygon": {
			"USDC": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
			"USDT": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
			"WETH": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
			"WBTC": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
			"LINK": "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
		},
		"BSC": {
			"USDC": "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
			"USDT": "0x55d398326f99059fF775485246999027B3197955",
			"DAI":  "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
		},
		"Avalanche": {
			"USDC": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
			"USDT": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
		},
	}

	if chainTokens, ok := tokenAddresses[chain]; ok {
		if addr, ok := chainTokens[ticker]; ok {
			return addr
		}
	}

	return ""
}

func inferChainFromTicker(ticker string) string {
	nativeCoins := map[string]string{
		"BTC":   "Bitcoin",
		"ETH":   "Ethereum",
		"SOL":   "Solana",
		"ATOM":  "Cosmos",
		"RUNE":  "THORChain",
		"CACAO": "MayaChain",
		"DOGE":  "Dogecoin",
		"LTC":   "Litecoin",
		"BCH":   "Bitcoin-Cash",
		"AVAX":  "Avalanche",
		"BNB":   "BSC",
		"MATIC": "Polygon",
		"ARB":   "Arbitrum",
		"OP":    "Optimism",
		"SUI":   "Sui",
		"DOT":   "Polkadot",
		"XRP":   "Ripple",
		"TON":   "Ton",
		"TRX":   "Tron",
		"DASH":  "Dash",
	}

	if chain, ok := nativeCoins[ticker]; ok {
		return chain
	}

	// Common tokens - default to Ethereum if no chain specified
	commonTokens := map[string]bool{
		"USDC":  true,
		"USDT":  true,
		"DAI":   true,
		"WETH":  true,
		"WBTC":  true,
		"LINK":  true,
		"UNI":   true,
		"AAVE":  true,
		"CRV":   true,
		"MKR":   true,
		"COMP":  true,
		"SNX":   true,
		"SUSHI": true,
		"YFI":   true,
		"1INCH": true,
		"GRT":   true,
		"ENS":   true,
		"LDO":   true,
		"RPL":   true,
		"PEPE":  true,
		"SHIB":  true,
		"APE":   true,
		"DYDX":  true,
		"IMX":   true,
		"BLUR":  true,
		"ARB":   true,
		"OP":    true,
	}

	if commonTokens[ticker] {
		return "Ethereum"
	}

	return ""
}
