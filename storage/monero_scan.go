package storage

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type MoneroScanData struct {
	Address          string  `json:"address"`
	PublicKeyECDSA   string  `json:"public_key_ecdsa"`
	ScanHeight       *int64  `json:"scan_height"`
	ScanTarget       *int64  `json:"scan_target"`
	BirthHeight      *int64  `json:"birth_height"`
	BirthdayScanDone bool    `json:"birthday_scan_done"`
	Balance          string  `json:"balance"`
	WalletKeysData   *string `json:"wallet_keys_data"`
	WalletCacheData  *string `json:"wallet_cache_data"`
	OutputsJSON      string  `json:"outputs_json"`
}

func (s *Store) GetMoneroScanData(publicKeyECDSA string) (*MoneroScanData, error) {
	query := `SELECT address, public_key_ecdsa, scan_height, scan_target,
		birth_height, birthday_scan_done, balance, wallet_keys_data, wallet_cache_data, outputs_json
		FROM monero_scan_data WHERE public_key_ecdsa = ?`

	row := s.db.QueryRow(query, publicKeyECDSA)

	var data MoneroScanData
	var scanHeight, scanTarget, birthHeight sql.NullInt64
	var walletKeysData, walletCacheData sql.NullString

	err := row.Scan(
		&data.Address,
		&data.PublicKeyECDSA,
		&scanHeight,
		&scanTarget,
		&birthHeight,
		&data.BirthdayScanDone,
		&data.Balance,
		&walletKeysData,
		&walletCacheData,
		&data.OutputsJSON,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("could not get monero scan data: %w", err)
	}

	if scanHeight.Valid {
		data.ScanHeight = &scanHeight.Int64
	}
	if scanTarget.Valid {
		data.ScanTarget = &scanTarget.Int64
	}
	if birthHeight.Valid {
		data.BirthHeight = &birthHeight.Int64
	}
	if walletKeysData.Valid {
		data.WalletKeysData = &walletKeysData.String
	}
	if walletCacheData.Valid {
		data.WalletCacheData = &walletCacheData.String
	}

	return &data, nil
}

func (s *Store) SaveMoneroScanData(data *MoneroScanData) error {
	columns := []string{
		"address",
		"public_key_ecdsa",
		"scan_height",
		"scan_target",
		"birth_height",
		"birthday_scan_done",
		"balance",
		"wallet_keys_data",
		"wallet_cache_data",
		"outputs_json",
	}

	query := fmt.Sprintf(`INSERT OR REPLACE INTO monero_scan_data (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))

	_, err := s.db.Exec(query,
		data.Address,
		data.PublicKeyECDSA,
		data.ScanHeight,
		data.ScanTarget,
		data.BirthHeight,
		data.BirthdayScanDone,
		data.Balance,
		data.WalletKeysData,
		data.WalletCacheData,
		data.OutputsJSON,
	)
	if err != nil {
		return fmt.Errorf("could not save monero scan data: %w", err)
	}

	return nil
}
