package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/agent/portfoliobridge"
)

type GetPortfolioTool struct{}

func NewGetPortfolioTool() *GetPortfolioTool {
	return &GetPortfolioTool{}
}

func (t *GetPortfolioTool) Name() string {
	return "get_portfolio"
}

func (t *GetPortfolioTool) Description() string {
	return "Get total portfolio value in USD for all coins in the vault. Returns per-coin values, per-chain totals, and overall total portfolio value."
}

func (t *GetPortfolioTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *GetPortfolioTool) RequiresPassword() bool {
	return false
}

func (t *GetPortfolioTool) RequiresConfirmation() bool {
	return false
}

func (t *GetPortfolioTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	resp, err := portfoliobridge.RequestPortfolio(ctx.AppCtx, ctx.Ctx, ctx.VaultPubKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get portfolio data: %w", err)
	}

	var coinsOutput []map[string]any
	for _, coin := range resp.Coins {
		entry := map[string]any{
			"chain":     coin.Chain,
			"ticker":    coin.Ticker,
			"balance":   coin.Balance,
			"value_usd": coin.ValueUSD,
			"price_usd": coin.PriceUSD,
		}
		if coin.Logo != "" {
			entry["logo"] = coin.Logo
		}
		coinsOutput = append(coinsOutput, entry)
	}

	var chainsOutput []map[string]any
	for _, chain := range resp.Chains {
		chainsOutput = append(chainsOutput, map[string]any{
			"chain":     chain.Chain,
			"value_usd": chain.ValueUSD,
		})
	}

	return map[string]any{
		"total_value_usd": resp.TotalUSD,
		"chains":          chainsOutput,
		"coins":           coinsOutput,
	}, nil
}
