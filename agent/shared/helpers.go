package shared

import (
	"math/big"
	"strings"

	"github.com/vultisig/vultisig-win/agent/toolbridge"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/tss"
)

var DefaultRelayURL = tss.VULTISIG_ROUTER_URL

func FormatBalance(balance *big.Int, decimals int, maxDecimals int) string {
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
	for len(remainderStr) < decimals {
		remainderStr = "0" + remainderStr
	}

	remainderStr = strings.TrimRight(remainderStr, "0")
	if remainderStr == "" {
		return whole.String()
	}

	if len(remainderStr) > maxDecimals {
		remainderStr = remainderStr[:maxDecimals]
	}

	return whole.String() + "." + remainderStr
}

func BearerAuth(token string) string {
	t := strings.TrimSpace(token)
	if t == "" {
		return ""
	}
	if strings.HasPrefix(strings.ToLower(t), "bearer ") {
		return "Bearer " + strings.TrimSpace(t[7:])
	}
	return "Bearer " + t
}

func MapCoinsToToolbridge(coins []storage.Coin) []toolbridge.CoinInfo {
	result := make([]toolbridge.CoinInfo, 0, len(coins))
	for _, c := range coins {
		result = append(result, toolbridge.CoinInfo{
			Chain:           c.Chain,
			Ticker:          c.Ticker,
			Address:         c.Address,
			ContractAddress: c.ContractAddress,
			Decimals:        int(c.Decimals),
			Logo:            c.Logo,
			PriceProviderID: c.PriceProviderID,
			IsNativeToken:   c.IsNativeToken,
		})
	}
	return result
}
