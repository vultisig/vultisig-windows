package tools

import (
	"context"
	"fmt"
	"math/big"
	"strings"

	"github.com/vultisig/vultisig-win/agent/balancebridge"
)

type GetBalancesTool struct{}

func NewGetBalancesTool() *GetBalancesTool {
	return &GetBalancesTool{}
}

func (t *GetBalancesTool) Name() string {
	return "get_balances"
}

func (t *GetBalancesTool) Description() string {
	return "Get live on-chain balances for coins/tokens in the vault. Supports EVM chains (Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche, etc.), Bitcoin, Litecoin, Dogecoin, Solana, Cosmos chains (THORChain, Maya, Osmosis, etc.), Tron, Sui, TON, Ripple/XRP, and Polkadot."
}

func (t *GetBalancesTool) InputSchema() map[string]any {
	return map[string]any{
		"chain": map[string]any{
			"type":        "string",
			"description": "Optional: filter by specific chain (e.g., 'Ethereum', 'Bitcoin', 'Solana')",
		},
		"ticker": map[string]any{
			"type":        "string",
			"description": "Optional: filter by specific ticker (e.g., 'ETH', 'BTC', 'USDC')",
		},
	}
}

func (t *GetBalancesTool) RequiresPassword() bool {
	return false
}

func (t *GetBalancesTool) RequiresConfirmation() bool {
	return false
}

func (t *GetBalancesTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	var chainFilter, tickerFilter string
	if chainRaw, ok := input["chain"]; ok && chainRaw != nil {
		if s, ok := chainRaw.(string); ok {
			chainFilter = strings.ToLower(s)
		}
	}
	if tickerRaw, ok := input["ticker"]; ok && tickerRaw != nil {
		if s, ok := tickerRaw.(string); ok {
			tickerFilter = strings.ToUpper(s)
		}
	}

	var coins []map[string]any
	for _, coin := range ctx.Vault.Coins {
		if chainFilter != "" && strings.ToLower(coin.Chain) != chainFilter {
			continue
		}
		if tickerFilter != "" && strings.ToUpper(coin.Ticker) != tickerFilter {
			continue
		}

		coinInfo := map[string]any{
			"chain":            coin.Chain,
			"ticker":           coin.Ticker,
			"address":          coin.Address,
			"is_native":        coin.IsNativeToken,
			"decimals":         coin.Decimals,
			"contract_address": coin.ContractAddress,
		}

		balance, balanceFormatted, fetchErr := t.fetchBalance(
			ctx.AppCtx,
			ctx.Ctx,
			coin.Chain,
			coin.Address,
			coin.ContractAddress,
			coin.IsNativeToken,
			coin.Decimals,
		)
		if fetchErr != nil {
			coinInfo["balance_error"] = fetchErr.Error()
			coinInfo["balance_raw"] = "0"
			coinInfo["balance"] = "0"
		} else {
			coinInfo["balance_raw"] = balance.String()
			coinInfo["balance"] = balanceFormatted
		}

		if coin.Logo != "" {
			coinInfo["logo"] = coin.Logo
		}

		coins = append(coins, coinInfo)
	}

	return map[string]any{
		"coins": coins,
		"count": len(coins),
	}, nil
}

func (t *GetBalancesTool) fetchBalance(appCtx, waitCtx context.Context, chain, address, contractAddress string, isNative bool, decimals int32) (*big.Int, string, error) {
	id := ""
	if !isNative && contractAddress != "" {
		id = contractAddress
	}

	resp, err := balancebridge.RequestBalance(appCtx, waitCtx, balancebridge.BalanceRequest{
		Chain:   chain,
		Address: address,
		ID:      id,
	})
	if err != nil {
		return nil, "", err
	}

	balance := new(big.Int)
	_, ok := balance.SetString(resp.Balance, 10)
	if !ok {
		return nil, "", fmt.Errorf("invalid balance: %s", resp.Balance)
	}

	return balance, formatBalance(balance, decimals), nil
}

func formatBalance(balance *big.Int, decimals int32) string {
	if balance == nil || balance.Sign() == 0 {
		return "0"
	}

	divisor := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals)), nil)
	whole := new(big.Int).Div(balance, divisor)
	remainder := new(big.Int).Mod(balance, divisor)

	if remainder.Sign() == 0 {
		return whole.String()
	}

	remainderStr := remainder.String()
	for len(remainderStr) < int(decimals) {
		remainderStr = "0" + remainderStr
	}

	remainderStr = strings.TrimRight(remainderStr, "0")
	if remainderStr == "" {
		return whole.String()
	}

	if len(remainderStr) > 6 {
		remainderStr = remainderStr[:6]
	}

	return whole.String() + "." + remainderStr
}
