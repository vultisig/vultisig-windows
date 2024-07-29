package storage

type Store struct {
}

// NewStore creates a new store
func NewStore() (*Store, error) {
	return &Store{}, nil
}

// SaveVault saves a vault
func (s *Store) SaveVault(vault *Vault) (string, error) {
	return "", nil
}

// GetVault gets a vault
func (s *Store) GetVault(id string) (*Vault, error) {
	return nil, nil
}

// GetVaults gets all vaults
func (s *Store) GetVaults() ([]*Vault, error) {
	return nil, nil
}

// DeleteVault deletes a vault
func (s *Store) DeleteVault(id string) error {
	return nil
}

func (s *Store) GetCoins(vaultID string) ([]*Coin, error) {
	return nil, nil
}

func (s *Store) DeleteCoin(vaultID, coinID string) error {
	return nil
}

func (s *Store) AddCoin(vaultID string, coin *Coin) (string, error) {
	return "", nil
}
func (s *Store) SaveCoin(vaultID string, coin *Coin) error {
	return nil
}
