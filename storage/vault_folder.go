package storage

type VaultFolder struct {
	ID    string  `json:"id"`
	Title string  `json:"title"`
	Order float64 `json:"order"`
}
