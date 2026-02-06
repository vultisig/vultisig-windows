package rpc

import (
	"fmt"
	"math/big"
	"strings"
)

const rippleRPCUrl = "https://s1.ripple.com:51234"

func IsRippleChain(chain string) bool {
	c := strings.ToLower(chain)
	return c == "ripple" || c == "xrp"
}

func GetRippleBalance(address string) (*big.Int, error) {
	req := map[string]any{
		"method": "account_info",
		"params": []map[string]any{
			{
				"account":      address,
				"ledger_index": "validated",
			},
		},
	}

	var resp struct {
		Result struct {
			AccountData struct {
				Balance string `json:"Balance"`
			} `json:"account_data"`
			Error string `json:"error"`
		} `json:"result"`
	}

	err := PostJSON(rippleRPCUrl, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Result.Error != "" {
		if resp.Result.Error == "actNotFound" {
			return big.NewInt(0), nil
		}
		return nil, fmt.Errorf("Ripple RPC error: %s", resp.Result.Error)
	}

	balance := new(big.Int)
	balance.SetString(resp.Result.AccountData.Balance, 10)
	return balance, nil
}
