package rpc

import (
	"encoding/json"
	"fmt"
	"math/big"
)

const solanaRPCUrl = vultisigAPIBase + "/solana/"

type solanaRPCResponse struct {
	Result json.RawMessage `json:"result"`
	Error  *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

type solanaBalanceResult struct {
	Value uint64 `json:"value"`
}

type solanaTokenAccountsResult struct {
	Value []struct {
		Account struct {
			Data struct {
				Parsed struct {
					Info struct {
						Mint        string `json:"mint"`
						TokenAmount struct {
							Amount string `json:"amount"`
						} `json:"tokenAmount"`
					} `json:"info"`
				} `json:"parsed"`
			} `json:"data"`
		} `json:"account"`
	} `json:"value"`
}

func IsSolanaChain(chain string) bool {
	return chain == "solana" || chain == "Solana"
}

func GetSolanaBalance(address string) (*big.Int, error) {
	req := map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "getBalance",
		"params":  []string{address},
	}

	var resp solanaRPCResponse
	err := PostJSON(solanaRPCUrl, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("Solana RPC error: %s", resp.Error.Message)
	}

	var result solanaBalanceResult
	err = json.Unmarshal(resp.Result, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal balance: %w", err)
	}

	return big.NewInt(int64(result.Value)), nil
}

func GetSolanaTokenBalance(address, mintAddress string) (*big.Int, error) {
	req := map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "getTokenAccountsByOwner",
		"params": []any{
			address,
			map[string]string{"mint": mintAddress},
			map[string]string{"encoding": "jsonParsed"},
		},
	}

	var resp solanaRPCResponse
	err := PostJSON(solanaRPCUrl, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("Solana RPC error: %s", resp.Error.Message)
	}

	var result solanaTokenAccountsResult
	err = json.Unmarshal(resp.Result, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal token accounts: %w", err)
	}

	if len(result.Value) == 0 {
		return big.NewInt(0), nil
	}

	amount := result.Value[0].Account.Data.Parsed.Info.TokenAmount.Amount
	balance := new(big.Int)
	balance.SetString(amount, 10)
	return balance, nil
}
