package rpc

import (
	"fmt"
	"math/big"
	"strings"
)

var utxoChains = map[string]bool{
	"bitcoin":      true,
	"litecoin":     true,
	"dogecoin":     true,
	"bitcoincash":  true,
	"dash":         true,
	"zcash":        true,
}

type blockchairResponse struct {
	Data map[string]struct {
		Address struct {
			Balance int64 `json:"balance"`
		} `json:"address"`
	} `json:"data"`
}

func IsUTXOChain(chain string) bool {
	return utxoChains[strings.ToLower(chain)]
}

func GetUTXOBalance(chain, address string) (*big.Int, error) {
	chainLower := strings.ToLower(chain)
	if !utxoChains[chainLower] {
		return nil, fmt.Errorf("unsupported UTXO chain: %s", chain)
	}

	url := fmt.Sprintf("%s/blockchair/%s/dashboards/address/%s", vultisigAPIBase, chainLower, address)

	var resp blockchairResponse
	err := GetJSON(url, &resp)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch UTXO balance: %w", err)
	}

	addrData, ok := resp.Data[address]
	if !ok {
		return big.NewInt(0), nil
	}

	return big.NewInt(addrData.Address.Balance), nil
}
