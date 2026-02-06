package shared

import (
	"os"
	"strings"
)

const (
	DefaultVerifierURL = "https://verifier.vultisig.com"
	DefaultRelayURL    = "https://api.vultisig.com/router"
	ClaudeModel        = "claude-sonnet-4-20250514"
)

type PluginInfo struct {
	ID        string
	Aliases   []string
	Name      string
	ServerURL string
}

var KnownPlugins = []PluginInfo{
	{
		ID:        "vultisig-dca-0000",
		Aliases:   []string{"dca", "recurring-swaps"},
		Name:      "Recurring Swaps (DCA)",
		ServerURL: "https://plugin-dca-swap.prod.plugins.vultisig.com",
	},
	{
		ID:        "vultisig-fees-feee",
		Aliases:   []string{"fee", "fees"},
		Name:      "Vultisig Fees",
		ServerURL: "https://plugin-fees.prod.plugins.vultisig.com",
	},
	{
		ID:        "vultisig-recurring-sends-0000",
		Aliases:   []string{"sends", "recurring-sends"},
		Name:      "Recurring Sends",
		ServerURL: "https://plugin-dca-send.prod.plugins.vultisig.com",
	},
}

var pluginAliasMap map[string]string

func init() {
	pluginAliasMap = make(map[string]string)
	for _, p := range KnownPlugins {
		for _, alias := range p.Aliases {
			pluginAliasMap[strings.ToLower(alias)] = p.ID
		}
	}
}

func ResolvePluginID(input string) string {
	lower := strings.ToLower(input)
	if full, ok := pluginAliasMap[lower]; ok {
		return full
	}
	return input
}

func GetPluginServerURL(pluginIDOrAlias string) string {
	id := ResolvePluginID(pluginIDOrAlias)
	for _, p := range KnownPlugins {
		if p.ID == id {
			return p.ServerURL
		}
	}
	return ""
}

func GetPluginName(pluginIDOrAlias string) string {
	id := ResolvePluginID(pluginIDOrAlias)
	for _, p := range KnownPlugins {
		if p.ID == id {
			return p.Name
		}
	}
	return id
}

type AssetInfo struct {
	Chain           string
	TokenAddress    string
	IsNative        bool
	Ticker          string
	Decimals        int
	PriceProviderID string
}

var AssetAliases = map[string]AssetInfo{
	"eth": {Chain: "Ethereum", IsNative: true, Ticker: "ETH", Decimals: 18},
	"btc": {Chain: "Bitcoin", IsNative: true, Ticker: "BTC", Decimals: 8},
	"sol": {Chain: "Solana", IsNative: true, Ticker: "SOL", Decimals: 9},
	"bnb": {Chain: "BSC", IsNative: true, Ticker: "BNB", Decimals: 18},

	"usdc":           {Chain: "Ethereum", TokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", Ticker: "USDC", Decimals: 6},
	"usdt":           {Chain: "Ethereum", TokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", Ticker: "USDT", Decimals: 6},
	"usdc:ethereum":  {Chain: "Ethereum", TokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", Ticker: "USDC", Decimals: 6},
	"usdc:arbitrum":  {Chain: "Arbitrum", TokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", Ticker: "USDC", Decimals: 6},
	"usdc:base":      {Chain: "Base", TokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", Ticker: "USDC", Decimals: 6},
	"usdc:polygon":   {Chain: "Polygon", TokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", Ticker: "USDC", Decimals: 6},
	"usdc:optimism":  {Chain: "Optimism", TokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", Ticker: "USDC", Decimals: 6},
	"usdc:avalanche": {Chain: "Avalanche", TokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", Ticker: "USDC", Decimals: 6},
	"usdc:bsc":       {Chain: "BSC", TokenAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", Ticker: "USDC", Decimals: 18},
	"usdc:solana":    {Chain: "Solana", TokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", Ticker: "USDC", Decimals: 6},

	"usdt:ethereum": {Chain: "Ethereum", TokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", Ticker: "USDT", Decimals: 6},
	"usdt:arbitrum": {Chain: "Arbitrum", TokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", Ticker: "USDT", Decimals: 6},
	"usdt:tron":     {Chain: "Tron", TokenAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", Ticker: "USDT", Decimals: 6},
	"usdt:bsc":      {Chain: "BSC", TokenAddress: "0x55d398326f99059fF775485246999027B3197955", Ticker: "USDT", Decimals: 18},

	"base.eth": {Chain: "Base", IsNative: true, Ticker: "ETH", Decimals: 18},
	"arb.eth":  {Chain: "Arbitrum", IsNative: true, Ticker: "ETH", Decimals: 18},
	"op.eth":   {Chain: "Optimism", IsNative: true, Ticker: "ETH", Decimals: 18},
	"avax":     {Chain: "Avalanche", IsNative: true, Ticker: "AVAX", Decimals: 18},
	"matic":    {Chain: "Polygon", IsNative: true, Ticker: "MATIC", Decimals: 18},
	"trx":      {Chain: "Tron", IsNative: true, Ticker: "TRX", Decimals: 6},
}

func ResolveAsset(input string) *AssetInfo {
	lower := strings.ToLower(input)
	if asset, ok := AssetAliases[lower]; ok {
		return &asset
	}
	return nil
}

func GetVerifierURL() string {
	if url := os.Getenv("VULTISIG_VERIFIER_URL"); url != "" {
		return url
	}
	return DefaultVerifierURL
}

func GetClaudeAPIKey() string {
	return os.Getenv("ANTHROPIC_API_KEY")
}
