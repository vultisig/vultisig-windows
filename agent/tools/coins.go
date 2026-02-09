package tools

import (
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/agent/chainbridge"
	"github.com/vultisig/vultisig-win/storage"
)

type GetCoinsTool struct{}

func NewGetCoinsTool() *GetCoinsTool {
	return &GetCoinsTool{}
}

func (t *GetCoinsTool) Name() string {
	return "get_coins"
}

func (t *GetCoinsTool) Description() string {
	return "List coins/tokens tracked in the current vault. Optionally filter by chain. Returns chain, ticker, address, and whether it's a native token or ERC-20/SPL token."
}

func (t *GetCoinsTool) InputSchema() map[string]any {
	return map[string]any{
		"chain": map[string]any{
			"type":        "string",
			"description": "Optional chain to filter by (e.g., 'Ethereum', 'Bitcoin', 'Solana'). If omitted, returns coins from all chains.",
		},
	}
}

func (t *GetCoinsTool) RequiresPassword() bool {
	return false
}

func (t *GetCoinsTool) RequiresConfirmation() bool {
	return false
}

func (t *GetCoinsTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	filterChain := ""
	if chainRaw, ok := input["chain"]; ok && chainRaw != nil {
		filterChain = chainRaw.(string)
	}

	var coins []map[string]any
	for _, coin := range ctx.Vault.Coins {
		if filterChain != "" && !strings.EqualFold(coin.Chain, filterChain) {
			continue
		}
		coinInfo := map[string]any{
			"id":               coin.ID,
			"chain":            coin.Chain,
			"ticker":           coin.Ticker,
			"address":          coin.Address,
			"is_native":        coin.IsNativeToken,
			"decimals":         coin.Decimals,
			"contract_address": coin.ContractAddress,
		}
		coins = append(coins, coinInfo)
	}

	return map[string]any{
		"coins": coins,
		"count": len(coins),
	}, nil
}

type AddCoinTool struct {
	store *storage.Store
}

func NewAddCoinTool(store *storage.Store) *AddCoinTool {
	return &AddCoinTool{store: store}
}

func (t *AddCoinTool) Name() string {
	return "add_coin"
}

func (t *AddCoinTool) Description() string {
	return "Add a coin/token to the current vault. For native tokens, provide chain and ticker. For ERC-20/tokens, also provide the contract address. The address will be derived from the vault's public key."
}

func (t *AddCoinTool) InputSchema() map[string]any {
	return map[string]any{
		"chain": map[string]any{
			"type":        "string",
			"description": "The blockchain chain (e.g., 'Ethereum', 'Bitcoin', 'Solana', 'BSC')",
		},
		"ticker": map[string]any{
			"type":        "string",
			"description": "The token ticker symbol (e.g., 'ETH', 'USDC', 'BTC')",
		},
		"contract_address": map[string]any{
			"type":        "string",
			"description": "Token contract address (required for non-native tokens like USDC, USDT)",
		},
		"decimals": map[string]any{
			"type":        "number",
			"description": "Token decimals (default: 18 for EVM, 9 for Solana, 8 for Bitcoin)",
		},
		"is_native": map[string]any{
			"type":        "boolean",
			"description": "Whether this is the native token of the chain (default: false if contract_address provided)",
		},
	}
}

func (t *AddCoinTool) RequiresPassword() bool {
	return false
}

func (t *AddCoinTool) RequiresConfirmation() bool {
	return false
}

func (t *AddCoinTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	chainRaw, ok := input["chain"]
	if !ok {
		return nil, fmt.Errorf("chain is required")
	}
	chain := chainRaw.(string)

	tickerRaw, ok := input["ticker"]
	if !ok {
		return nil, fmt.Errorf("ticker is required")
	}
	ticker := strings.ToUpper(tickerRaw.(string))

	var contractAddress string
	if contractRaw, ok := input["contract_address"]; ok {
		contractAddress = contractRaw.(string)
	}

	isNative := contractAddress == ""
	if isNativeRaw, ok := input["is_native"]; ok {
		isNative = isNativeRaw.(bool)
	}

	decimals := int32(18)
	if decimalsRaw, ok := input["decimals"]; ok {
		switch v := decimalsRaw.(type) {
		case float64:
			decimals = int32(v)
		case int:
			decimals = int32(v)
		}
	} else {
		switch strings.ToLower(chain) {
		case "bitcoin":
			decimals = 8
		case "solana":
			decimals = 9
		}
	}

	existingAddress := ""
	for _, coin := range ctx.Vault.Coins {
		if strings.EqualFold(coin.Chain, chain) {
			existingAddress = coin.Address
			break
		}
	}

	if existingAddress == "" {
		resolvedChain, valid := resolveChainName(chain)
		if !valid {
			return nil, fmt.Errorf("chain '%s' is not a supported chain", chain)
		}
		chain = resolvedChain

		resp, err := chainbridge.RequestDeriveAddress(ctx.AppCtx, ctx.Ctx, chainbridge.DeriveAddressRequest{
			VaultPubKey: ctx.VaultPubKey,
			Chain:       chain,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to derive address for new chain %s: %w", chain, err)
		}
		existingAddress = resp.Address

		meta, hasMeta := chainMetadata[chain]
		if hasMeta {
			nativeCoin := storage.Coin{
				Chain:           chain,
				Ticker:          meta.Ticker,
				Address:         existingAddress,
				IsNativeToken:   true,
				Decimals:        meta.Decimals,
				Logo:            meta.Logo,
				PriceProviderID: meta.PriceProviderID,
			}
			_, saveErr := t.store.SaveCoin(ctx.VaultPubKey, nativeCoin)
			if saveErr != nil {
				return nil, fmt.Errorf("failed to save native coin for chain %s: %w", chain, saveErr)
			}
		}
	}

	for _, coin := range ctx.Vault.Coins {
		if strings.EqualFold(coin.Chain, chain) &&
			strings.EqualFold(coin.Ticker, ticker) &&
			strings.EqualFold(coin.ContractAddress, contractAddress) {
			return map[string]any{
				"success": false,
				"message": fmt.Sprintf("Coin %s on %s already exists in vault", ticker, chain),
			}, nil
		}
	}

	newCoin := storage.Coin{
		Chain:           chain,
		Ticker:          ticker,
		Address:         existingAddress,
		ContractAddress: contractAddress,
		IsNativeToken:   isNative,
		Decimals:        decimals,
	}

	coinID, err := t.store.SaveCoin(ctx.VaultPubKey, newCoin)
	if err != nil {
		return nil, fmt.Errorf("failed to save coin: %w", err)
	}

	runtime.EventsEmit(ctx.AppCtx, "vault:coins-changed")

	return map[string]any{
		"success":          true,
		"coin_id":          coinID,
		"chain":            chain,
		"ticker":           ticker,
		"address":          existingAddress,
		"contract_address": contractAddress,
		"message":          fmt.Sprintf("Successfully added %s on %s to vault", ticker, chain),
	}, nil
}

type RemoveCoinTool struct {
	store *storage.Store
}

func NewRemoveCoinTool(store *storage.Store) *RemoveCoinTool {
	return &RemoveCoinTool{store: store}
}

func (t *RemoveCoinTool) Name() string {
	return "remove_coin"
}

func (t *RemoveCoinTool) Description() string {
	return "Remove a coin/token from the current vault. Provide either the coin ID directly, or the chain and ticker to identify the coin."
}

func (t *RemoveCoinTool) InputSchema() map[string]any {
	return map[string]any{
		"coin_id": map[string]any{
			"type":        "string",
			"description": "The unique ID of the coin to remove",
		},
		"chain": map[string]any{
			"type":        "string",
			"description": "The blockchain chain (use with ticker to identify coin)",
		},
		"ticker": map[string]any{
			"type":        "string",
			"description": "The token ticker symbol (use with chain to identify coin)",
		},
	}
}

func (t *RemoveCoinTool) RequiresPassword() bool {
	return false
}

func (t *RemoveCoinTool) RequiresConfirmation() bool {
	return false
}

func (t *RemoveCoinTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	var coinID string
	var coinToRemove *storage.Coin

	if coinIDRaw, ok := input["coin_id"]; ok {
		coinID = coinIDRaw.(string)
		for _, coin := range ctx.Vault.Coins {
			if coin.ID == coinID {
				coinToRemove = &coin
				break
			}
		}
	} else {
		chainRaw, chainOk := input["chain"]
		tickerRaw, tickerOk := input["ticker"]

		if !chainOk || !tickerOk {
			return nil, fmt.Errorf("either coin_id or both chain and ticker are required")
		}

		chain := chainRaw.(string)
		ticker := tickerRaw.(string)

		for _, coin := range ctx.Vault.Coins {
			if strings.EqualFold(coin.Chain, chain) && strings.EqualFold(coin.Ticker, ticker) {
				coinToRemove = &coin
				coinID = coin.ID
				break
			}
		}
	}

	if coinToRemove == nil {
		return map[string]any{
			"success": false,
			"message": "Coin not found in vault",
		}, nil
	}

	err := t.store.DeleteCoin(ctx.VaultPubKey, coinID)
	if err != nil {
		return nil, fmt.Errorf("failed to delete coin: %w", err)
	}

	runtime.EventsEmit(ctx.AppCtx, "vault:coins-changed")

	return map[string]any{
		"success": true,
		"chain":   coinToRemove.Chain,
		"ticker":  coinToRemove.Ticker,
		"message": fmt.Sprintf("Successfully removed %s from %s", coinToRemove.Ticker, coinToRemove.Chain),
	}, nil
}
