package tools

import (
	"fmt"
	"sort"
	"strings"
)

type GetChainsTool struct{}

func NewGetChainsTool() *GetChainsTool {
	return &GetChainsTool{}
}

func (t *GetChainsTool) Name() string {
	return "get_chains"
}

func (t *GetChainsTool) Description() string {
	return "Get all blockchain chains in the current vault with their addresses. Returns a list of chains with the wallet address for each."
}

func (t *GetChainsTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *GetChainsTool) RequiresPassword() bool {
	return false
}

func (t *GetChainsTool) RequiresConfirmation() bool {
	return false
}

func (t *GetChainsTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	chainMap := make(map[string]string)
	for _, coin := range ctx.Vault.Coins {
		if _, exists := chainMap[coin.Chain]; !exists {
			chainMap[coin.Chain] = coin.Address
		}
	}

	var chains []map[string]string
	for chain, addr := range chainMap {
		chains = append(chains, map[string]string{
			"chain":   chain,
			"address": addr,
		})
	}

	sort.Slice(chains, func(i, j int) bool {
		return chains[i]["chain"] < chains[j]["chain"]
	})

	return map[string]any{
		"chains": chains,
		"count":  len(chains),
	}, nil
}

type GetChainAddressTool struct{}

func NewGetChainAddressTool() *GetChainAddressTool {
	return &GetChainAddressTool{}
}

func (t *GetChainAddressTool) Name() string {
	return "get_chain_address"
}

func (t *GetChainAddressTool) Description() string {
	return "Get the wallet address for a specific blockchain chain in the CURRENT active vault only. For other vaults, use list_vaults which returns chain_addresses for all vaults."
}

func (t *GetChainAddressTool) InputSchema() map[string]any {
	return map[string]any{
		"chain": map[string]any{
			"type":        "string",
			"description": "The blockchain chain name (e.g., 'Ethereum', 'Bitcoin', 'Solana', 'BSC')",
		},
	}
}

func (t *GetChainAddressTool) RequiresPassword() bool {
	return false
}

func (t *GetChainAddressTool) RequiresConfirmation() bool {
	return false
}

func (t *GetChainAddressTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	chainRaw, ok := input["chain"]
	if !ok {
		return nil, fmt.Errorf("chain is required")
	}
	chain := chainRaw.(string)

	chainLower := strings.ToLower(chain)
	for _, coin := range ctx.Vault.Coins {
		if strings.ToLower(coin.Chain) == chainLower {
			return map[string]any{
				"chain":   coin.Chain,
				"address": coin.Address,
				"found":   true,
			}, nil
		}
	}

	var availableChains []string
	seen := make(map[string]bool)
	for _, coin := range ctx.Vault.Coins {
		if !seen[coin.Chain] {
			availableChains = append(availableChains, coin.Chain)
			seen[coin.Chain] = true
		}
	}

	return map[string]any{
		"found":            false,
		"message":          fmt.Sprintf("Chain '%s' not found in vault", chain),
		"available_chains": availableChains,
	}, nil
}
