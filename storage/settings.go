package storage

type Settings struct {
	Language      string   `json:"language"`
	Currency      string   `json:"currency"`
	DefaultChains []string `json:"default_chains"`
}
