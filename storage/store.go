package storage

import (
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/zerolog"
)

const DbFileName = "vultisig.db"

//go:embed migrate/*.sql
var migrations embed.FS

type Store struct {
	log zerolog.Logger
	db  *sql.DB
}

// NewStore creates a new store
func NewStore() (*Store, error) {
	db, err := sql.Open("sqlite3", DbFileName)
	if err != nil {
		return nil, fmt.Errorf("fail to open sqlite db,err: %w", err)
	}
	return &Store{
		db:  db,
		log: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}, nil
}

// Migrate migrates the db
func (s *Store) Migrate() error {
	driver, err := sqlite3.WithInstance(s.db, &sqlite3.Config{})
	if err != nil {
		return fmt.Errorf("could not create sqlite driver, err: %w", err)
	}

	d, err := iofs.New(migrations, "migrate")
	if err != nil {
		return fmt.Errorf("could not create iofs driver, err: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", d, "sqlite3", driver)
	if err != nil {
		return fmt.Errorf("could not create migrate instance, err: %w", err)
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("could not apply migrations, err: %w", err)
	}

	return nil
}

// SaveVault saves a vault
func (s *Store) SaveVault(vault *Vault) error {
	if vault.PublicKeyECDSA == "" {
		return fmt.Errorf("invalid , vault's public key ecdsa is required")
	}

	buf, err := json.Marshal(vault.Signers)
	if err != nil {
		return fmt.Errorf("could not marshal signers, err: %w", err)
	}
	query := `INSERT OR REPLACE INTO vaults (name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code, local_party_id, signers,reshare_prefix, listorder, is_backedup)
							  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err = s.db.Exec(query,
		vault.Name,
		vault.PublicKeyECDSA,
		vault.PublicKeyEdDSA,
		vault.CreatedAt,
		vault.HexChainCode,
		vault.LocalPartyID,
		string(buf),
		vault.ResharePrefix,
		vault.Order,
		vault.IsBackedUp)
	if err != nil {
		return fmt.Errorf("could not upsert vault, err: %w", err)
	}
	for _, keyShare := range vault.KeyShares {
		if err := s.saveKeyshare(vault.PublicKeyECDSA, keyShare); err != nil {
			return fmt.Errorf("could not save keyshare, err: %w", err)
		}
	}
	for _, coin := range vault.Coins {
		if _, err := s.SaveCoin(vault.PublicKeyECDSA, coin); err != nil {
			return fmt.Errorf("could not save coin, err: %w", err)
		}
	}
	return nil
}

// UpdateVaultName updates the vault name
func (s *Store) UpdateVaultName(publicKeyECDSA, name string) error {
	query := `UPDATE vaults SET name = ? WHERE public_key_ecdsa = ?`
	_, err := s.db.Exec(query, name, publicKeyECDSA)
	return err
}

// GetVault gets a vault
func (s *Store) GetVault(publicKeyEcdsa string) (*Vault, error) {
	query := `SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code, local_party_id, signers,reshare_prefix, listorder, is_backedup FROM vaults WHERE public_key_ecdsa = ?`
	row := s.db.QueryRow(query, publicKeyEcdsa)
	var signers string
	var vault Vault
	err := row.Scan(&vault.Name,
		&vault.PublicKeyECDSA,
		&vault.PublicKeyEdDSA,
		&vault.CreatedAt,
		&vault.HexChainCode,
		&vault.LocalPartyID,
		&signers,
		&vault.ResharePrefix,
		&vault.Order,
		&vault.IsBackedUp)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("vault not found")
		}
		return nil, fmt.Errorf("could not scan vault, err: %w", err)
	}
	if err := json.Unmarshal([]byte(signers), &vault.Signers); err != nil {
		return nil, fmt.Errorf("could not unmarshal signers, err: %w", err)
	}

	keyShares, err := s.getKeyShares(publicKeyEcdsa)
	if err != nil {
		return nil, fmt.Errorf("could not get keyshares, err: %w", err)
	}
	vault.KeyShares = keyShares
	coins, err := s.GetCoins(publicKeyEcdsa)
	if err != nil {
		return nil, fmt.Errorf("could not get coins, err: %w", err)
	}
	vault.Coins = coins
	return &vault, nil
}
func (s *Store) closeRows(rows *sql.Rows) {
	err := rows.Close()
	if err != nil {
		s.log.Error().Err(err).Msg("could not close rows")
	}
}
func (s *Store) saveKeyshare(vaultPublicKeyECDSA string, keyShare KeyShare) error {
	query := `INSERT OR REPLACE INTO keyshares (public_key_ecdsa, public_key, keyshare) VALUES (?, ?, ?)`
	_, err := s.db.Exec(query, vaultPublicKeyECDSA, keyShare.PublicKey, keyShare.KeyShare)
	if err != nil {
		return fmt.Errorf("could not upsert keyshare, err: %w", err)
	}
	return nil
}
func (s *Store) getKeyShares(vaultPublicKeyECDSA string) ([]KeyShare, error) {
	keySharesQuery := `SELECT public_key, keyshare FROM keyshares WHERE public_key_ecdsa = ?`
	keySharesRows, err := s.db.Query(keySharesQuery, vaultPublicKeyECDSA)
	if err != nil {
		return nil, fmt.Errorf("could not query keyshares, err: %w", err)
	}
	defer s.closeRows(keySharesRows)
	var keyShares []KeyShare
	for keySharesRows.Next() {
		var keyShare KeyShare
		if err := keySharesRows.Scan(&keyShare.PublicKey, &keyShare.KeyShare); err != nil {
			return nil, fmt.Errorf("could not scan keyshare, err: %w", err)
		}
		keyShares = append(keyShares, keyShare)
	}
	return keyShares, nil
}

// GetVaults gets all vaults
func (s *Store) GetVaults() ([]*Vault, error) {
	query := `SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code, local_party_id, reshare_prefix, listorder, is_backedup FROM vaults`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query vaults, err: %w", err)
	}
	defer s.closeRows(rows)

	var vaults []*Vault
	for rows.Next() {
		var vault Vault
		err := rows.Scan(&vault.Name,
			&vault.PublicKeyECDSA,
			&vault.PublicKeyEdDSA,
			&vault.CreatedAt,
			&vault.HexChainCode,
			&vault.LocalPartyID,
			&vault.ResharePrefix,
			&vault.Order,
			&vault.IsBackedUp)
		if err != nil {
			return nil, fmt.Errorf("could not scan vault, err: %w", err)
		}

		keyShares, err := s.getKeyShares(vault.PublicKeyECDSA)
		if err != nil {
			return nil, fmt.Errorf("could not get keyshares, err: %w", err)
		}
		vault.KeyShares = keyShares
		coins, err := s.GetCoins(vault.PublicKeyECDSA)
		if err != nil {
			return nil, fmt.Errorf("could not get coins, err: %w", err)
		}
		vault.Coins = coins

		vaults = append(vaults, &vault)
	}

	return vaults, nil
}

// DeleteVault deletes a vault
func (s *Store) DeleteVault(publicKeyECDSA string) error {
	_, err := s.db.Exec("DELETE FROM vaults WHERE public_key_ecdsa = ?", publicKeyECDSA)
	return err
}

// GetCoins gets all coins belongs to the vault
func (s *Store) GetCoins(vaultPublicKeyECDSA string) ([]Coin, error) {
	var coins []Coin
	coinsQuery := `SELECT id, chain, address, hex_public_key, ticker, contract_address, is_native_token, logo, price_provider_id, raw_balance, price_rate FROM coins WHERE public_key_ecdsa = ?`
	coinsRows, err := s.db.Query(coinsQuery, vaultPublicKeyECDSA)
	if err != nil {
		return nil, fmt.Errorf("could not query coins, err: %w", err)
	}
	defer s.closeRows(coinsRows)

	for coinsRows.Next() {
		var coin Coin
		if err := coinsRows.Scan(&coin.ID,
			&coin.Chain,
			&coin.Address,
			&coin.HexPublicKey,
			&coin.Ticker,
			&coin.ContractAddress,
			&coin.IsNativeToken,
			&coin.Logo,
			&coin.PriceProviderID,
		); err != nil {
			return nil, fmt.Errorf("could not scan coin, err: %w", err)
		}
		coins = append(coins, coin)
	}
	return coins, nil
}

func (s *Store) DeleteCoin(vaultPublicKeyECDSA, coinID string) error {
	_, err := s.db.Exec("DELETE FROM coins WHERE id = ? AND public_key_ecdsa = ?", coinID, vaultPublicKeyECDSA)
	return err
}

func (s *Store) SaveCoin(vaultPublicKeyECDSA string, coin Coin) (string, error) {
	if coin.ID == "" {
		coin.ID = uuid.New().String()
	}
	query := `INSERT OR REPLACE INTO coins (
				id, 
				chain, 
				address, 
				hex_public_key, 
				ticker, 
				contract_address, 
				is_native_token, 
				logo, 
				price_provider_id, 
				raw_balance, 
				price_rate, 
				public_key_ecdsa)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := s.db.Exec(query, coin.ID, coin.Chain, coin.Address, coin.HexPublicKey, coin.Ticker, coin.ContractAddress, coin.IsNativeToken, coin.Logo, coin.PriceProviderID, coin.RawBalance, coin.PriceRate, vaultPublicKeyECDSA)
	if err != nil {
		return "", fmt.Errorf("could not upsert coin, err: %w", err)
	}
	return coin.ID, nil
}

// Close the db connection
func (s *Store) Close() error {
	return s.db.Close()
}
