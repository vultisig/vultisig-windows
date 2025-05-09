package storage

type Coin struct {
	ID              string         `json:"id"`
	Chain           string         `json:"chain"`
	Address         string         `json:"address"`
	Ticker          string         `json:"ticker"`
	ContractAddress string         `json:"contract_address"`
	IsNativeToken   bool           `json:"is_native_token"`
	Logo            string         `json:"logo"`
	PriceProviderID string         `json:"price_provider_id"`
	Decimals        int32          `json:"decimals"`
}
