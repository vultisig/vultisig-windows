package storage

import (
	"database/sql"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

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
	dbPath := os.Getenv(`VULTISIG_DB_PATH`)
	if dbPath == "" {
		// Get the current running folder
		exePath, err := os.Executable()
		if err != nil {
			return nil, fmt.Errorf("fail to get current directory, err: %w", err)
		}
		dbPath = exePath
	}
	exeDir := filepath.Dir(dbPath)
	// Construct the full path to the database file
	dbFilePath := filepath.Join(exeDir, DbFileName)

	db, err := sql.Open("sqlite3", dbFilePath+"?_journal_mode=WAL")
	if err != nil {
		return nil, fmt.Errorf("fail to open sqlite db, err: %w", err)
	}

	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return nil, fmt.Errorf("could not enable foreign key constraints: %w", err)
	}

	return &Store{
		db:  db,
		log: zerolog.New(os.Stdout).With().Timestamp().Logger(),
	}, nil
}

// Migrate migrates the db
func (s *Store) Migrate() error {
	driver, err := sqlite3.WithInstance(s.db, &sqlite3.Config{
		NoTxWrap: true,
	})
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
		return fmt.Errorf("invalid vault, public key ecdsa is required")
	}

	buf, err := json.Marshal(vault.Signers)
	if err != nil {
		return fmt.Errorf("could not marshal signers, err: %w", err)
	}

	columns := []string{
		"name",
		"public_key_ecdsa",
		"public_key_eddsa",
		"created_at",
		"hex_chain_code",
		"local_party_id",
		"signers",
		"reshare_prefix",
		"\"order\"",
		"is_backedup",
		"folder_id",
		"lib_type",
	}
	query := fmt.Sprintf(`INSERT OR REPLACE INTO vaults (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))

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
		vault.IsBackedUp,
		vault.FolderID,
		vault.LibType,
	)
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

func (s *Store) GetVault(publicKeyEcdsa string) (*Vault, error) {
	query := `SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
		local_party_id, signers, reshare_prefix, "order", is_backedup, folder_id, lib_type
		FROM vaults WHERE public_key_ecdsa = ?`
	row := s.db.QueryRow(query, publicKeyEcdsa)
	var signers string
	var vault Vault
	var folderID sql.NullString
	err := row.Scan(&vault.Name,
		&vault.PublicKeyECDSA,
		&vault.PublicKeyEdDSA,
		&vault.CreatedAt,
		&vault.HexChainCode,
		&vault.LocalPartyID,
		&signers,
		&vault.ResharePrefix,
		&vault.Order,
		&vault.IsBackedUp,
		&folderID,
		&vault.LibType,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("vault not found")
		}
		return nil, fmt.Errorf("could not scan vault, err: %w", err)
	}
	if folderID.Valid {
		vault.FolderID = &folderID.String
	} else {
		vault.FolderID = nil
	}
	if err := json.Unmarshal([]byte(signers), &vault.Signers); err != nil {
		return nil, fmt.Errorf("could not unmarshal signers, err: %w", err)
	}
	keyShares, err := s.getKeyShares(publicKeyEcdsa)
	if err != nil {
		return nil, fmt.Errorf("could not get keyshares, err: %w", err)
	}
	vault.KeyShares = keyShares
	return &vault, nil
}

func (s *Store) closeRows(rows *sql.Rows) {
	err := rows.Close()
	if err != nil {
		s.log.Error().Err(err).Msg("could not close rows")
	}
}

func (s *Store) saveKeyshare(vaultPublicKeyECDSA string, keyShare KeyShare) error {
	// delete existing keyshare first
	deleteQuery := `DELETE FROM keyshares WHERE public_key_ecdsa = ? AND public_key = ?`
	_, err := s.db.Exec(deleteQuery, vaultPublicKeyECDSA, keyShare.PublicKey)
	if err != nil {
		return fmt.Errorf("could not delete keyshare, err: %w", err)
	}
	// insert new keyshare
	columns := []string{
		"public_key_ecdsa",
		"public_key",
		"keyshare",
	}
	query := fmt.Sprintf(`INSERT OR REPLACE INTO keyshares (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))
	_, err = s.db.Exec(query, vaultPublicKeyECDSA, keyShare.PublicKey, keyShare.KeyShare)
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

func (s *Store) GetVaults() ([]*Vault, error) {
	query := `SELECT name, public_key_ecdsa, public_key_eddsa, created_at, hex_chain_code,
		local_party_id, signers, reshare_prefix, "order", is_backedup, folder_id, lib_type FROM vaults`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query vaults, err: %w", err)
	}
	defer s.closeRows(rows)

	var vaults []*Vault
	for rows.Next() {
		var vault Vault
		var signers string
		var folderID sql.NullString
		err := rows.Scan(&vault.Name,
			&vault.PublicKeyECDSA,
			&vault.PublicKeyEdDSA,
			&vault.CreatedAt,
			&vault.HexChainCode,
			&vault.LocalPartyID,
			&signers,
			&vault.ResharePrefix,
			&vault.Order,
			&vault.IsBackedUp,
			&folderID,
			&vault.LibType,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan vault, err: %w", err)
		}
		if folderID.Valid {
			vault.FolderID = &folderID.String
		} else {
			vault.FolderID = nil
		}
		if err := json.Unmarshal([]byte(signers), &vault.Signers); err != nil {
			return nil, fmt.Errorf("could not unmarshal signers, err: %w", err)
		}
		keyShares, err := s.getKeyShares(vault.PublicKeyECDSA)
		if err != nil {
			return nil, fmt.Errorf("could not get keyshares, err: %w", err)
		}
		vault.KeyShares = keyShares

		vaults = append(vaults, &vault)
	}
	return vaults, nil
}

// DeleteVault deletes a vault
func (s *Store) DeleteVault(publicKeyECDSA string) error {
	_, err := s.db.Exec("DELETE FROM vaults WHERE public_key_ecdsa = ?", publicKeyECDSA)
	return err
}

func (s *Store) GetCoins() (map[string][]Coin, error) {
	coinsQuery := `SELECT id, chain, address, ticker, contract_address, is_native_token, logo, price_provider_id, decimals, public_key_ecdsa 
		FROM coins`
	rows, err := s.db.Query(coinsQuery)
	if err != nil {
		return nil, fmt.Errorf("could not query coins: %w", err)
	}
	defer s.closeRows(rows)

	// Initialize the map to store coins grouped by vault
	vaultCoins := make(map[string][]Coin)

	for rows.Next() {
		var coin Coin
		var publicKeyECDSA string
		if err := rows.Scan(&coin.ID,
			&coin.Chain,
			&coin.Address,
			&coin.Ticker,
			&coin.ContractAddress,
			&coin.IsNativeToken,
			&coin.Logo,
			&coin.PriceProviderID,
			&coin.Decimals,
			&publicKeyECDSA,
		); err != nil {
			return nil, fmt.Errorf("could not scan coin: %w", err)
		}
		// Add the coin to the appropriate vault's slice
		vaultCoins[publicKeyECDSA] = append(vaultCoins[publicKeyECDSA], coin)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error occurred during iteration of rows: %w", err)
	}

	return vaultCoins, nil
}

func (s *Store) SaveAddressBookItem(item AddressBookItem) (string, error) {
	if item.ID == "" {
		item.ID = uuid.New().String()
	}
	columns := []string{
		"id",
		"title",
		"address",
		"chain",
	}
	query := fmt.Sprintf(`INSERT OR REPLACE INTO address_book (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))
	_, err := s.db.Exec(query, item.ID, item.Title, item.Address, item.Chain)
	if err != nil {
		return "", fmt.Errorf("could not upsert address book item, err: %w", err)
	}
	return item.ID, nil
}

// Delete address book item by id
func (s *Store) DeleteAddressBookItem(id string) error {
	query := `DELETE FROM address_book WHERE id = ?`
	_, err := s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("could not delete address book item, err: %w", err)
	}
	return nil
}

// Update address book item by id
func (s *Store) UpdateAddressBookItem(item AddressBookItem) error {
	query := `UPDATE address_book SET title = ?, address = ?, chain = ? WHERE id = ?`
	_, err := s.db.Exec(query, item.Title, item.Address, item.Chain, item.ID)
	if err != nil {
		return fmt.Errorf("could not update address book item, err: %w", err)
	}
	return nil
}

// Get all address book items
func (s *Store) GetAllAddressBookItems() ([]AddressBookItem, error) {
	query := `SELECT id, title, address, chain FROM address_book`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query address book, err: %w", err)
	}
	defer s.closeRows(rows)

	var addressBookItems []AddressBookItem
	for rows.Next() {
		var addressBookItem AddressBookItem
		if err := rows.Scan(&addressBookItem.ID, &addressBookItem.Title, &addressBookItem.Address, &addressBookItem.Chain); err != nil {
			return nil, fmt.Errorf("could not scan address book item, err: %w", err)
		}
		addressBookItems = append(addressBookItems, addressBookItem)
	}

	return addressBookItems, nil
}

// GetAddressBookItem retrieves a single address book item by ID
func (s *Store) GetAddressBookItem(id string) (*AddressBookItem, error) {
	query := `SELECT id, title, address, chain FROM address_book WHERE id = ?`
	row := s.db.QueryRow(query, id)
	
	var item AddressBookItem
	err := row.Scan(&item.ID, &item.Title, &item.Address, &item.Chain)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("address book item not found")
		}
		return nil, fmt.Errorf("could not scan address book item, err: %w", err)
	}
	
	return &item, nil
}

func (s *Store) DeleteCoin(vaultPublicKeyECDSA, coinID string) error {
	_, err := s.db.Exec("DELETE FROM coins WHERE id = ? AND public_key_ecdsa = ?", coinID, vaultPublicKeyECDSA)
	return err
}

// generatePlaceholders generates the correct number of SQL placeholders
func generatePlaceholders(count int) string {
	placeholders := make([]string, count)
	for i := 0; i < count; i++ {
		placeholders[i] = "?"
	}
	return strings.Join(placeholders, ", ")
}

func (s *Store) SaveCoin(vaultPublicKeyECDSA string, coin Coin) (string, error) {
	if coin.ID == "" {
		coin.ID = uuid.New().String()
	}
	columns := []string{
		"id",
		"chain",
		"address",
		"ticker",
		"contract_address",
		"is_native_token",
		"logo",
		"price_provider_id",
		"decimals",
		"public_key_ecdsa",
	}
	query := fmt.Sprintf(`INSERT OR REPLACE INTO coins (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))
	_, err := s.db.Exec(query, coin.ID, coin.Chain, coin.Address, coin.Ticker, coin.ContractAddress, coin.IsNativeToken, coin.Logo, coin.PriceProviderID, coin.Decimals, vaultPublicKeyECDSA)
	if err != nil {
		return "", fmt.Errorf("could not upsert coin, err: %w", err)
	}
	return coin.ID, nil
}

// SaveCoins saves multiple coins for a vault in a single transaction
func (s *Store) SaveCoins(vaultPublicKeyECDSA string, coins []Coin) ([]string, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("could not begin transaction: %w", err)
	}
	defer func() {
		if err != nil {
			if rbErr := tx.Rollback(); rbErr != nil {
				s.log.Error().Err(rbErr).Msg("could not rollback transaction")
			}
		}
	}()

	columns := []string{
		"id",
		"chain",
		"address",
		"ticker",
		"contract_address",
		"is_native_token",
		"logo",
		"price_provider_id",
		"decimals",
		"public_key_ecdsa",
	}
	query := fmt.Sprintf(`INSERT OR REPLACE INTO coins (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))

	stmt, err := tx.Prepare(query)
	if err != nil {
		return nil, fmt.Errorf("could not prepare statement: %w", err)
	}
	defer stmt.Close()

	coinIDs := make([]string, len(coins))
	for i, coin := range coins {
		if coin.ID == "" {
			coin.ID = uuid.New().String()
		}
		coinIDs[i] = coin.ID

		_, err = stmt.Exec(
			coin.ID,
			coin.Chain,
			coin.Address,
			coin.Ticker,
			coin.ContractAddress,
			coin.IsNativeToken,
			coin.Logo,
			coin.PriceProviderID,
			coin.Decimals,
			vaultPublicKeyECDSA,
		)
		if err != nil {
			return nil, fmt.Errorf("could not insert coin %s: %w", coin.ID, err)
		}
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("could not commit transaction: %w", err)
	}

	return coinIDs, nil
}

func (s *Store) SaveVaultFolder(folder *VaultFolder) (string, error) {
	if folder.ID == "" {
		folder.ID = uuid.New().String()
	}
	columns := []string{
		"id",
		"name",
		"\"order\"",
	}
	query := fmt.Sprintf(`INSERT OR REPLACE INTO vault_folders (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))
	_, err := s.db.Exec(query, folder.ID, folder.Name, folder.Order)
	if err != nil {
		return "", fmt.Errorf("could not upsert vault folder, err: %w", err)
	}
	return folder.ID, nil
}

func (s *Store) GetVaultFolders() ([]*VaultFolder, error) {
	query := `SELECT id, name, "order" FROM vault_folders ORDER BY "order"`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not query vault folders, err: %w", err)
	}
	defer s.closeRows(rows)

	var folders []*VaultFolder
	for rows.Next() {
		var folder VaultFolder
		if err := rows.Scan(&folder.ID, &folder.Name, &folder.Order); err != nil {
			return nil, fmt.Errorf("could not scan vault folder, err: %w", err)
		}
		folders = append(folders, &folder)
	}
	return folders, nil
}

func (s *Store) DeleteVaultFolder(id string) error {
	// Set folder_id to NULL for all vaults that reference the folder being deleted
	_, err := s.db.Exec("UPDATE vaults SET folder_id = NULL WHERE folder_id = ?", id)
	if err != nil {
		return fmt.Errorf("could not update vaults to set folder_id to NULL, err: %w", err)
	}

	// Delete the vault folder
	_, err = s.db.Exec("DELETE FROM vault_folders WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("could not delete vault folder, err: %w", err)
	}
	return nil
}

func (s *Store) GetVaultFolder(id string) (*VaultFolder, error) {
	query := `SELECT id, name, "order" FROM vault_folders WHERE id = ?`
	row := s.db.QueryRow(query, id)
	
	var folder VaultFolder
	err := row.Scan(&folder.ID, &folder.Name, &folder.Order)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("vault folder not found")
		}
		return nil, fmt.Errorf("could not scan vault folder, err: %w", err)
	}
	
	return &folder, nil
}

// Close the db connection
func (s *Store) Close() error {
	return s.db.Close()
}
