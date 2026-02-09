package tools

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/agent/tools/rpc"
)

const marketPriceBaseURL = "https://api.vultisig.com/coingeicko/api/v3/simple/price"

type GetMarketPriceTool struct{}

func NewGetMarketPriceTool() *GetMarketPriceTool {
	return &GetMarketPriceTool{}
}

func (t *GetMarketPriceTool) Name() string {
	return "get_market_price"
}

func (t *GetMarketPriceTool) Description() string {
	return "Get the latest market price for a cryptocurrency in a fiat currency (default USD). Supports common tickers like BTC/ETH/SOL and CoinGecko IDs."
}

func (t *GetMarketPriceTool) InputSchema() map[string]any {
	return map[string]any{
		"asset": map[string]any{
			"type":        "string",
			"description": "Asset symbol or id (e.g., 'BTC', 'ETH', 'bitcoin', 'usd-coin')",
		},
		"fiat": map[string]any{
			"type":        "string",
			"description": "Fiat quote currency (default: 'usd'), e.g. 'usd', 'eur', 'gbp'",
		},
	}
}

func (t *GetMarketPriceTool) RequiresPassword() bool {
	return false
}

func (t *GetMarketPriceTool) RequiresConfirmation() bool {
	return false
}

func (t *GetMarketPriceTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	assetRaw, ok := input["asset"]
	if !ok || assetRaw == nil {
		return nil, fmt.Errorf("asset is required")
	}

	asset, ok := assetRaw.(string)
	if !ok {
		return nil, fmt.Errorf("asset must be a string")
	}
	asset = strings.TrimSpace(asset)
	if asset == "" {
		return nil, fmt.Errorf("asset is required")
	}

	fiat := "usd"
	if fiatRaw, exists := input["fiat"]; exists && fiatRaw != nil {
		fiatStr, ok := fiatRaw.(string)
		if !ok {
			return nil, fmt.Errorf("fiat must be a string")
		}
		fiatStr = strings.TrimSpace(strings.ToLower(fiatStr))
		if fiatStr != "" {
			fiat = fiatStr
		}
	}

	priceProviderID := t.resolvePriceProviderID(asset, ctx)

	q := url.Values{}
	q.Set("ids", priceProviderID)
	q.Set("vs_currencies", fiat)

	endpoint := marketPriceBaseURL + "?" + q.Encode()

	var resp map[string]map[string]float64
	err := rpc.GetJSON(endpoint, &resp)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch market price: %w", err)
	}

	coinData, ok := resp[strings.ToLower(priceProviderID)]
	if !ok {
		coinData, ok = resp[priceProviderID]
	}
	if !ok {
		return map[string]any{
			"found":             false,
			"asset":             asset,
			"price_provider_id": priceProviderID,
			"fiat":              fiat,
			"message":           fmt.Sprintf("No market price available for '%s'", asset),
			"source":            "api.vultisig.com/coingeicko/api/v3/simple/price",
		}, nil
	}

	price, ok := coinData[strings.ToLower(fiat)]
	if !ok {
		price, ok = coinData[fiat]
	}
	if !ok {
		return map[string]any{
			"found":             false,
			"asset":             asset,
			"price_provider_id": priceProviderID,
			"fiat":              fiat,
			"message":           fmt.Sprintf("No '%s' quote available for '%s'", fiat, asset),
			"source":            "api.vultisig.com/coingeicko/api/v3/simple/price",
		}, nil
	}

	return map[string]any{
		"found":             true,
		"asset":             asset,
		"price_provider_id": priceProviderID,
		"fiat":              fiat,
		"price":             price,
		"source":            "api.vultisig.com/coingeicko/api/v3/simple/price",
		"as_of":             time.Now().UTC().Format(time.RFC3339),
	}, nil
}

func (t *GetMarketPriceTool) resolvePriceProviderID(asset string, ctx *ExecutionContext) string {
	normalized := strings.TrimSpace(strings.ToLower(asset))

	if resolved := shared.ResolveAsset(normalized); resolved != nil && resolved.PriceProviderID != "" {
		return strings.ToLower(resolved.PriceProviderID)
	}

	if ctx != nil && ctx.Vault != nil {
		for _, coin := range ctx.Vault.Coins {
			if strings.EqualFold(coin.Ticker, normalized) && coin.PriceProviderID != "" {
				return strings.ToLower(coin.PriceProviderID)
			}
		}
	}

	if id, ok := commonTickerToPriceProviderID[strings.ToUpper(normalized)]; ok {
		return id
	}

	return normalized
}

var commonTickerToPriceProviderID = map[string]string{
	"BTC":   "bitcoin",
	"ETH":   "ethereum",
	"SOL":   "solana",
	"BNB":   "binancecoin",
	"AVAX":  "avalanche-2",
	"MATIC": "polygon-ecosystem-token",
	"DOT":   "polkadot",
	"XRP":   "ripple",
	"TON":   "the-open-network",
	"TRX":   "tron",
	"DOGE":  "dogecoin",
	"LTC":   "litecoin",
	"BCH":   "bitcoin-cash",
	"USDC":  "usd-coin",
	"USDT":  "tether",
}

