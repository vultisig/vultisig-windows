package storage

import (
	"time"
)

type KeyShare struct {
	PublicKey string `json:"public_key"`
	KeyShare  string `json:"keyshare"`
}

// Vault represent the vault
type Vault struct {
	Name           string     `json:"name"`
	PublicKeyECDSA string     `json:"public_key_ecdsa"`
	PublicKeyEdDSA string     `json:"public_key_eddsa"`
	Signers        []string   `json:"signers"`
	CreatedAt      time.Time  `json:"created_at"`
	HexChainCode   string     `json:"hex_chain_code"`
	KeyShares      []KeyShare `json:"keyshares"`
	LocalPartyID   string     `json:"local_party_id"`
	ResharePrefix  string     `json:"reshare_prefix"`
	Order          float64    `json:"order"`
	IsBackedUp     bool       `json:"is_backed_up"`
	Coins          []Coin     `json:"coins"`
	FolderID			 *string `json:"folder_id,omitempty"`
	LibType			 string   `json:"lib_type"`
}
