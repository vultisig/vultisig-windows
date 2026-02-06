package rpc

import (
	"fmt"
	"math/big"
	"strings"
)

const tronRPCUrl = "https://api.trongrid.io"
const tronJSONRPCUrl = "https://api.trongrid.io/jsonrpc"

type tronAccountResponse struct {
	Balance int64 `json:"balance"`
}

func IsTronChain(chain string) bool {
	return strings.ToLower(chain) == "tron"
}

func GetTronBalance(address string) (*big.Int, error) {
	url := tronRPCUrl + "/wallet/getaccount"

	payload := map[string]any{
		"address": address,
		"visible": true,
	}

	var resp tronAccountResponse
	err := PostJSON(url, payload, &resp)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Tron balance: %w", err)
	}

	return big.NewInt(resp.Balance), nil
}

func GetTRC20Balance(contractAddress, walletAddress string) (*big.Int, error) {
	hexContract := tronAddressToHex(contractAddress)
	hexWallet := tronAddressToHex(walletAddress)

	if hexContract == "" || hexWallet == "" {
		return nil, fmt.Errorf("failed to convert Tron addresses")
	}

	paddedWallet := "0000000000000000000000" + hexWallet[2:]
	data := "0x70a08231" + paddedWallet

	fromAddr := "0x" + hexWallet[4:]
	toAddr := "0x" + hexContract[4:]

	req := map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "eth_call",
		"params": []any{
			map[string]string{
				"from":     fromAddr,
				"to":       toAddr,
				"gas":      "0x0",
				"gasPrice": "0x0",
				"value":    "0x0",
				"data":     data,
			},
			"latest",
		},
	}

	var resp struct {
		Result string `json:"result"`
		Error  *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	err := PostJSON(tronJSONRPCUrl, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("Tron RPC error: %s", resp.Error.Message)
	}

	return hexToBigInt(resp.Result)
}

func tronAddressToHex(address string) string {
	alphabet := "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

	result := big.NewInt(0)
	for _, c := range address {
		idx := strings.IndexRune(alphabet, c)
		if idx == -1 {
			return ""
		}
		result.Mul(result, big.NewInt(58))
		result.Add(result, big.NewInt(int64(idx)))
	}

	bytes := result.Bytes()
	if len(bytes) < 25 {
		return ""
	}

	addressBytes := bytes[:len(bytes)-4]
	hex := fmt.Sprintf("%x", addressBytes)

	for len(hex) < 42 {
		hex = "0" + hex
	}

	return hex[:42]
}
