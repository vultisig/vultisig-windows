package storage

import "github.com/google/uuid"

type VaultFolder struct {
	ID      uuid.UUID
	Title   string
	Order   float64
}
