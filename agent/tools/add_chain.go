package tools

import (
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/agent/chainbridge"
	"github.com/vultisig/vultisig-win/storage"
)

type chainMeta struct {
	Ticker          string
	Decimals        int32
	Logo            string
	PriceProviderID string
}

var chainMetadata = map[string]chainMeta{
	"Bitcoin":      {Ticker: "BTC", Decimals: 8, Logo: "btc", PriceProviderID: "bitcoin"},
	"Bitcoin-Cash": {Ticker: "BCH", Decimals: 8, Logo: "bch", PriceProviderID: "bitcoin-cash"},
	"Litecoin":     {Ticker: "LTC", Decimals: 8, Logo: "ltc", PriceProviderID: "litecoin"},
	"Dogecoin":     {Ticker: "DOGE", Decimals: 8, Logo: "doge", PriceProviderID: "dogecoin"},
	"Dash":         {Ticker: "DASH", Decimals: 8, Logo: "dash", PriceProviderID: "dash"},
	"Zcash":        {Ticker: "ZEC", Decimals: 8, Logo: "zec", PriceProviderID: "zcash"},
	"Ethereum":     {Ticker: "ETH", Decimals: 18, Logo: "eth", PriceProviderID: "ethereum"},
	"Avalanche":    {Ticker: "AVAX", Decimals: 18, Logo: "avax", PriceProviderID: "avalanche-2"},
	"BSC":          {Ticker: "BNB", Decimals: 18, Logo: "bsc", PriceProviderID: "binancecoin"},
	"Polygon":      {Ticker: "POL", Decimals: 18, Logo: "polygon", PriceProviderID: "polygon-ecosystem-token"},
	"CronosChain":  {Ticker: "CRO", Decimals: 18, Logo: "cro", PriceProviderID: "crypto-com-chain"},
	"Arbitrum":     {Ticker: "ETH", Decimals: 18, Logo: "eth", PriceProviderID: "ethereum"},
	"Base":         {Ticker: "ETH", Decimals: 18, Logo: "eth", PriceProviderID: "ethereum"},
	"Blast":        {Ticker: "ETH", Decimals: 18, Logo: "eth", PriceProviderID: "ethereum"},
	"Optimism":     {Ticker: "ETH", Decimals: 18, Logo: "eth", PriceProviderID: "ethereum"},
	"Zksync":       {Ticker: "ETH", Decimals: 18, Logo: "eth", PriceProviderID: "ethereum"},
	"Mantle":       {Ticker: "MNT", Decimals: 18, Logo: "mantle", PriceProviderID: "mantle"},
	"Hyperliquid":  {Ticker: "HYPE", Decimals: 18, Logo: "hyperliquid", PriceProviderID: "hyperliquid"},
	"Sei":          {Ticker: "SEI", Decimals: 18, Logo: "sei", PriceProviderID: "sei-network"},
	"THORChain":    {Ticker: "RUNE", Decimals: 8, Logo: "rune", PriceProviderID: "thorchain"},
	"MayaChain":    {Ticker: "CACAO", Decimals: 10, Logo: "cacao", PriceProviderID: "cacao"},
	"Cosmos":       {Ticker: "ATOM", Decimals: 6, Logo: "atom", PriceProviderID: "cosmos"},
	"Osmosis":      {Ticker: "OSMO", Decimals: 6, Logo: "osmo", PriceProviderID: "osmosis"},
	"Dydx":         {Ticker: "DYDX", Decimals: 18, Logo: "dydx", PriceProviderID: "dydx-chain"},
	"Kujira":       {Ticker: "KUJI", Decimals: 6, Logo: "kuji", PriceProviderID: "kujira"},
	"Terra":        {Ticker: "LUNA", Decimals: 6, Logo: "luna", PriceProviderID: "terra-luna-2"},
	"TerraClassic": {Ticker: "LUNC", Decimals: 6, Logo: "lunc", PriceProviderID: "terra-luna"},
	"Noble":        {Ticker: "USDC", Decimals: 6, Logo: "noble", PriceProviderID: "usd-coin"},
	"Akash":        {Ticker: "AKT", Decimals: 6, Logo: "akash", PriceProviderID: "akash-network"},
	"Solana":       {Ticker: "SOL", Decimals: 9, Logo: "solana", PriceProviderID: "solana"},
	"Sui":          {Ticker: "SUI", Decimals: 9, Logo: "sui", PriceProviderID: "sui"},
	"Polkadot":     {Ticker: "DOT", Decimals: 10, Logo: "dot", PriceProviderID: "polkadot"},
	"Ton":          {Ticker: "TON", Decimals: 9, Logo: "ton", PriceProviderID: "the-open-network"},
	"Ripple":       {Ticker: "XRP", Decimals: 6, Logo: "xrp", PriceProviderID: "ripple"},
	"Tron":         {Ticker: "TRX", Decimals: 6, Logo: "tron", PriceProviderID: "tron"},
	"Cardano":      {Ticker: "ADA", Decimals: 6, Logo: "ada", PriceProviderID: "cardano"},
}

func resolveChainName(input string) (string, bool) {
	if _, ok := chainMetadata[input]; ok {
		return input, true
	}
	lower := strings.ToLower(input)
	for name := range chainMetadata {
		if strings.ToLower(name) == lower {
			return name, true
		}
	}
	return "", false
}

type RemoveChainTool struct {
	store *storage.Store
}

func NewRemoveChainTool(store *storage.Store) *RemoveChainTool {
	return &RemoveChainTool{store: store}
}

func (t *RemoveChainTool) Name() string {
	return "remove_chain"
}

func (t *RemoveChainTool) Description() string {
	return "Remove a blockchain chain and all its coins/tokens from the current vault."
}

func (t *RemoveChainTool) InputSchema() map[string]any {
	return map[string]any{
		"chain": map[string]any{
			"type":        "string",
			"description": "The blockchain chain name to remove (e.g., 'Sui', 'Solana', 'Ethereum')",
		},
	}
}

func (t *RemoveChainTool) RequiresPassword() bool {
	return false
}

func (t *RemoveChainTool) RequiresConfirmation() bool {
	return false
}

func (t *RemoveChainTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	chainRaw, ok := input["chain"]
	if !ok {
		return nil, fmt.Errorf("chain is required")
	}
	chainInput, ok := chainRaw.(string)
	if !ok {
		return nil, fmt.Errorf("chain must be a string")
	}

	chain, valid := resolveChainName(chainInput)
	if !valid {
		return nil, fmt.Errorf("unsupported chain '%s'", chainInput)
	}

	found := false
	for _, coin := range ctx.Vault.Coins {
		if strings.EqualFold(coin.Chain, chain) {
			found = true
			break
		}
	}
	if !found {
		return map[string]any{
			"success": false,
			"message": fmt.Sprintf("Chain %s is not in the vault", chain),
		}, nil
	}

	removed, err := t.store.DeleteCoinsByChain(ctx.VaultPubKey, chain)
	if err != nil {
		return nil, fmt.Errorf("failed to remove chain %s: %w", chain, err)
	}

	runtime.EventsEmit(ctx.AppCtx, "vault:coins-changed")

	return map[string]any{
		"success":       true,
		"chain":         chain,
		"coins_removed": removed,
		"message":       fmt.Sprintf("Successfully removed %s chain and %d coin(s) from vault", chain, removed),
	}, nil
}

type AddChainTool struct {
	store *storage.Store
}

func NewAddChainTool(store *storage.Store) *AddChainTool {
	return &AddChainTool{store: store}
}

func (t *AddChainTool) Name() string {
	return "add_chain"
}

func (t *AddChainTool) Description() string {
	return "Add a new blockchain chain to the current vault. This enables the vault to hold native tokens and other assets on that chain. Use this when the chain is not yet present in the vault."
}

func (t *AddChainTool) InputSchema() map[string]any {
	return map[string]any{
		"chain": map[string]any{
			"type":        "string",
			"description": "The blockchain chain name (e.g., 'Sui', 'Solana', 'Ethereum', 'Bitcoin')",
		},
	}
}

func (t *AddChainTool) RequiresPassword() bool {
	return false
}

func (t *AddChainTool) RequiresConfirmation() bool {
	return false
}

func (t *AddChainTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	chainRaw, ok := input["chain"]
	if !ok {
		return nil, fmt.Errorf("chain is required")
	}
	chainInput, ok := chainRaw.(string)
	if !ok {
		return nil, fmt.Errorf("chain must be a string")
	}

	chain, valid := resolveChainName(chainInput)
	if !valid {
		var supported []string
		for name := range chainMetadata {
			supported = append(supported, name)
		}
		return nil, fmt.Errorf("unsupported chain '%s'. Supported chains: %s", chainInput, strings.Join(supported, ", "))
	}

	for _, coin := range ctx.Vault.Coins {
		if strings.EqualFold(coin.Chain, chain) && coin.IsNativeToken {
			return map[string]any{
				"success": false,
				"message": fmt.Sprintf("Chain %s is already in the vault", chain),
			}, nil
		}
	}

	meta, ok := chainMetadata[chain]
	if !ok {
		return nil, fmt.Errorf("no metadata for chain '%s'", chain)
	}

	resp, err := chainbridge.RequestDeriveAddress(ctx.AppCtx, ctx.Ctx, chainbridge.DeriveAddressRequest{
		VaultPubKey: ctx.VaultPubKey,
		Chain:       chain,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to derive address for chain %s: %w", chain, err)
	}

	newCoin := storage.Coin{
		Chain:           chain,
		Ticker:          meta.Ticker,
		Address:         resp.Address,
		IsNativeToken:   true,
		Decimals:        meta.Decimals,
		Logo:            meta.Logo,
		PriceProviderID: meta.PriceProviderID,
	}

	coinID, err := t.store.SaveCoin(ctx.VaultPubKey, newCoin)
	if err != nil {
		return nil, fmt.Errorf("failed to save native coin for chain %s: %w", chain, err)
	}

	runtime.EventsEmit(ctx.AppCtx, "vault:coins-changed")

	return map[string]any{
		"success": true,
		"coin_id": coinID,
		"chain":   chain,
		"ticker":  meta.Ticker,
		"address": resp.Address,
		"message": fmt.Sprintf("Successfully added %s chain to vault with address %s", chain, resp.Address),
	}, nil
}
