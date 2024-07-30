package storage

import (
	"github.com/ethereum/go-ethereum/common"
)

type Coin struct {
	Chain           string         `json:"chain"`
	Address         string         `json:"address"`
	HexPublicKey    string         `json:"hex_public_key"`
	Ticker          string         `json:"ticker"`
	ContractAddress string         `json:"contract_address"`
	IsNativeToken   bool           `json:"is_native_token"`
	Logo            string         `json:"logo"`
	PriceProviderID string         `json:"price_provider_id"`
	RawBalance      string         `json:"raw_balance"`
	PriceRate       common.Decimal `json:"price_rate"`
}
