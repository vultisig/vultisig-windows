package rpc

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

var evmRPCUrls = map[string]string{
	"ethereum":    vultisigAPIBase + "/eth/",
	"bsc":         vultisigAPIBase + "/bsc/",
	"polygon":     vultisigAPIBase + "/polygon/",
	"avalanche":   vultisigAPIBase + "/avax/",
	"arbitrum":    vultisigAPIBase + "/arb/",
	"optimism":    vultisigAPIBase + "/opt/",
	"base":        vultisigAPIBase + "/base/",
	"blast":       vultisigAPIBase + "/blast/",
	"zksync":      vultisigAPIBase + "/zksync/",
	"mantle":      vultisigAPIBase + "/mantle/",
	"cronoschain": "https://cronos-evm-rpc.publicnode.com",
	"cronos":      "https://cronos-evm-rpc.publicnode.com",
	"sei":         "https://evm-rpc.sei-apis.com",
	"hyperliquid": vultisigAPIBase + "/hyperevm/",
}

type jsonRPCRequest struct {
	JSONRPC string `json:"jsonrpc"`
	Method  string `json:"method"`
	Params  []any  `json:"params"`
	ID      int    `json:"id"`
}

type jsonRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	Result  json.RawMessage `json:"result"`
	Error   *rpcError       `json:"error"`
	ID      int             `json:"id"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func GetEVMRPCUrl(chain string) (string, bool) {
	chainLower := strings.ToLower(chain)
	url, ok := evmRPCUrls[chainLower]
	return url, ok
}

func GetNativeBalance(rpcURL, address string) (*big.Int, error) {
	req := jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "eth_getBalance",
		Params:  []any{address, "latest"},
		ID:      1,
	}

	var resp jsonRPCResponse
	err := PostJSON(rpcURL, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("RPC error: %s", resp.Error.Message)
	}

	var hexBalance string
	err = json.Unmarshal(resp.Result, &hexBalance)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal balance: %w", err)
	}

	return hexToBigInt(hexBalance)
}

func GetERC20Balance(rpcURL, tokenAddress, walletAddress string) (*big.Int, error) {
	paddedAddress := "000000000000000000000000" + strings.TrimPrefix(strings.ToLower(walletAddress), "0x")
	data := "0x70a08231" + paddedAddress

	req := jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "eth_call",
		Params: []any{
			map[string]string{
				"to":   tokenAddress,
				"data": data,
			},
			"latest",
		},
		ID: 1,
	}

	var resp jsonRPCResponse
	err := PostJSON(rpcURL, req, &resp)
	if err != nil {
		return nil, err
	}

	if resp.Error != nil {
		return nil, fmt.Errorf("RPC error: %s", resp.Error.Message)
	}

	var hexBalance string
	err = json.Unmarshal(resp.Result, &hexBalance)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal balance: %w", err)
	}

	if hexBalance == "0x" || hexBalance == "" {
		return big.NewInt(0), nil
	}

	return hexToBigInt(hexBalance)
}

func hexToBigInt(hexStr string) (*big.Int, error) {
	hexStr = strings.TrimPrefix(hexStr, "0x")
	if hexStr == "" {
		return big.NewInt(0), nil
	}

	if len(hexStr)%2 != 0 {
		hexStr = "0" + hexStr
	}

	bytes, err := hex.DecodeString(hexStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode hex: %w", err)
	}

	return new(big.Int).SetBytes(bytes), nil
}

func IsEVMChain(chain string) bool {
	_, ok := evmRPCUrls[strings.ToLower(chain)]
	return ok
}
