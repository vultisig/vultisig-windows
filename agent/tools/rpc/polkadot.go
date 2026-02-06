package rpc

import (
	"fmt"
	"math/big"
	"strings"
)

const polkadotAPIUrl = "https://assethub-polkadot.api.subscan.io/api/v2/scan/search"

func IsPolkadotChain(chain string) bool {
	return strings.ToLower(chain) == "polkadot"
}

func GetPolkadotBalance(address string) (*big.Int, error) {
	payload := map[string]string{
		"key": address,
	}

	var resp struct {
		Data struct {
			Account struct {
				Balance float64 `json:"balance"`
			} `json:"account"`
		} `json:"data"`
		Message string `json:"message"`
	}

	err := PostJSON(polkadotAPIUrl, payload, &resp)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Polkadot balance: %w", err)
	}

	balanceFloat := resp.Data.Account.Balance
	balanceWei := new(big.Float).Mul(
		big.NewFloat(balanceFloat),
		new(big.Float).SetInt(new(big.Int).Exp(big.NewInt(10), big.NewInt(10), nil)),
	)

	balance := new(big.Int)
	balanceWei.Int(balance)
	return balance, nil
}
