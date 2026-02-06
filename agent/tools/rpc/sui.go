package rpc

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

const suiRPCUrl = "https://fullnode.mainnet.sui.io:443"

func IsSuiChain(chain string) bool {
	return strings.ToLower(chain) == "sui"
}

func GetSuiBalance(address string) (*big.Int, error) {
	req := map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "suix_getBalance",
		"params":  []string{address},
	}

	var resp struct {
		Result struct {
			TotalBalance string `json:"totalBalance"`
		} `json:"result"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	err := PostJSON(suiRPCUrl, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("Sui RPC error: %s", resp.Error.Message)
	}

	balance := new(big.Int)
	balance.SetString(resp.Result.TotalBalance, 10)
	return balance, nil
}

func GetSuiTokenBalance(address, coinType string) (*big.Int, error) {
	req := map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "suix_getBalance",
		"params":  []string{address, coinType},
	}

	var resp struct {
		Result json.RawMessage `json:"result"`
		Error  *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	err := PostJSON(suiRPCUrl, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("Sui RPC error: %s", resp.Error.Message)
	}

	var result struct {
		TotalBalance string `json:"totalBalance"`
	}
	err = json.Unmarshal(resp.Result, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal balance: %w", err)
	}

	balance := new(big.Int)
	balance.SetString(result.TotalBalance, 10)
	return balance, nil
}
