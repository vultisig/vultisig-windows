package tools

import (
	"fmt"
	"math/big"
	"strings"

	"github.com/vultisig/vultisig-win/agent/tools/rpc"
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
		chainFilter = strings.ToLower(chainRaw.(string))
	}
	if tickerRaw, ok := input["ticker"]; ok && tickerRaw != nil {
		tickerFilter = strings.ToUpper(tickerRaw.(string))
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

		balance, balanceFormatted, err := t.fetchBalance(
			coin.Chain,
			coin.Address,
			coin.ContractAddress,
			coin.IsNativeToken,
			coin.Decimals,
		)
		if err != nil {
			coinInfo["balance_error"] = err.Error()
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

func (t *GetBalancesTool) fetchBalance(chain, address, contractAddress string, isNative bool, decimals int32) (*big.Int, string, error) {
	var balance *big.Int
	var err error

	switch {
	case rpc.IsEVMChain(chain):
		balance, err = t.fetchEVMBalance(chain, address, contractAddress, isNative)

	case rpc.IsUTXOChain(chain):
		balance, err = rpc.GetUTXOBalance(chain, address)

	case rpc.IsSolanaChain(chain):
		if isNative || contractAddress == "" {
			balance, err = rpc.GetSolanaBalance(address)
		} else {
			balance, err = rpc.GetSolanaTokenBalance(address, contractAddress)
		}

	case rpc.IsCosmosChain(chain):
		denom := ""
		if !isNative && contractAddress != "" {
			denom = contractAddress
		}
		balance, err = rpc.GetCosmosBalance(chain, address, denom)

	case rpc.IsTronChain(chain):
		if isNative || contractAddress == "" {
			balance, err = rpc.GetTronBalance(address)
		} else {
			balance, err = rpc.GetTRC20Balance(contractAddress, address)
		}

	case rpc.IsSuiChain(chain):
		if isNative || contractAddress == "" {
			balance, err = rpc.GetSuiBalance(address)
		} else {
			balance, err = rpc.GetSuiTokenBalance(address, contractAddress)
		}

	case rpc.IsTONChain(chain):
		balance, err = rpc.GetTONBalance(address)

	case rpc.IsRippleChain(chain):
		balance, err = rpc.GetRippleBalance(address)

	case rpc.IsPolkadotChain(chain):
		balance, err = rpc.GetPolkadotBalance(address)

	default:
		return nil, "", fmt.Errorf("balance fetching not supported for chain: %s", chain)
	}

	if err != nil {
		return nil, "", err
	}

	formatted := formatBalance(balance, decimals)
	return balance, formatted, nil
}

func (t *GetBalancesTool) fetchEVMBalance(chain, address, contractAddress string, isNative bool) (*big.Int, error) {
	rpcURL, ok := rpc.GetEVMRPCUrl(chain)
	if !ok {
		return nil, fmt.Errorf("no RPC URL for EVM chain: %s", chain)
	}

	if isNative || contractAddress == "" {
		return rpc.GetNativeBalance(rpcURL, address)
	}
	return rpc.GetERC20Balance(rpcURL, contractAddress, address)
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
