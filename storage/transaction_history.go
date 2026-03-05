package storage

type TransactionRecord struct {
	ID          string `json:"id"`
	VaultID     string `json:"vault_id"`
	Type        string `json:"type"`
	Status      string `json:"status"`
	Chain       string `json:"chain"`
	Timestamp   string `json:"timestamp"`
	TxHash      string `json:"tx_hash"`
	ExplorerURL string `json:"explorer_url"`
	FiatValue   string `json:"fiat_value"`
	Data        string `json:"data"`
}
