package rpc

import (
	"fmt"
	"math/big"
	"strings"
)

const tonAPIUrl = "https://toncenter.com/api/v2"

func IsTONChain(chain string) bool {
	return strings.ToLower(chain) == "ton"
}

func GetTONBalance(address string) (*big.Int, error) {
	url := fmt.Sprintf("%s/getAddressBalance?address=%s", tonAPIUrl, address)

	var resp struct {
		OK     bool   `json:"ok"`
		Result string `json:"result"`
		Error  string `json:"error"`
	}

	err := GetJSON(url, &resp)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch TON balance: %w", err)
	}

	if !resp.OK {
		if resp.Error != "" {
			return nil, fmt.Errorf("TON API error: %s", resp.Error)
		}
		return big.NewInt(0), nil
	}

	balance := new(big.Int)
	balance.SetString(resp.Result, 10)

	if balance.Sign() < 0 {
		return big.NewInt(0), nil
	}

	return balance, nil
}
