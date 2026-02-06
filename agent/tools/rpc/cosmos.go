package rpc

import (
	"fmt"
	"math/big"
	"strings"
)

var cosmosRPCUrls = map[string]string{
	"thorchain":   "https://thornode.ninerealms.com",
	"mayachain":   "https://mayanode.mayachain.info",
	"gaiachain":   "https://cosmos-rest.publicnode.com",
	"cosmos":      "https://cosmos-rest.publicnode.com",
	"kujira":      "https://kujira-api.polkachu.com",
	"dydx":        "https://dydx-rest.publicnode.com",
	"osmosis":     "https://lcd.osmosis.zone",
	"noble":       "https://noble-api.polkachu.com",
	"terra":       "https://phoenix-lcd.terra.dev",
	"terraclassic": "https://terra-classic-lcd.publicnode.com",
}

var cosmosDenoms = map[string]string{
	"thorchain": "rune",
	"mayachain": "cacao",
	"gaiachain": "uatom",
	"cosmos":    "uatom",
	"kujira":    "ukuji",
	"dydx":      "adydx",
	"osmosis":   "uosmo",
	"noble":     "uusdc",
	"terra":     "uluna",
	"terraclassic": "uluna",
}

type cosmosBalanceResponse struct {
	Balances []struct {
		Denom  string `json:"denom"`
		Amount string `json:"amount"`
	} `json:"balances"`
}

func IsCosmosChain(chain string) bool {
	_, ok := cosmosRPCUrls[strings.ToLower(chain)]
	return ok
}

func GetCosmosBalance(chain, address, denom string) (*big.Int, error) {
	chainLower := strings.ToLower(chain)
	baseURL, ok := cosmosRPCUrls[chainLower]
	if !ok {
		return nil, fmt.Errorf("unsupported Cosmos chain: %s", chain)
	}

	if denom == "" {
		denom = cosmosDenoms[chainLower]
	}

	url := fmt.Sprintf("%s/cosmos/bank/v1beta1/balances/%s", baseURL, address)

	var resp cosmosBalanceResponse
	err := GetJSON(url, &resp)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Cosmos balance: %w", err)
	}

	for _, bal := range resp.Balances {
		if bal.Denom == denom {
			amount := new(big.Int)
			amount.SetString(bal.Amount, 10)
			return amount, nil
		}
	}

	return big.NewInt(0), nil
}
