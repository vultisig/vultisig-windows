package storage

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type ZcashScanData struct {
	ZAddress         string `json:"z_address"`
	PublicKeyECDSA   string `json:"public_key_ecdsa"`
	ScanHeight       *int64 `json:"scan_height"`
	ScanTarget       *int64 `json:"scan_target"`
	BirthHeight      *int64 `json:"birth_height"`
	BirthdayScanDone bool   `json:"birthday_scan_done"`
	PubKeyPackage    string `json:"pub_key_package"`
	SaplingExtras    string `json:"sapling_extras"`
	NotesJSON        string `json:"notes_json"`
	NullifierVersion int64  `json:"nullifier_version"`
}

func (s *Store) GetZcashScanData(publicKeyECDSA string) (*ZcashScanData, error) {
	query := `SELECT z_address, public_key_ecdsa, scan_height, scan_target,
		birth_height, birthday_scan_done, pub_key_package, sapling_extras, notes_json, nullifier_version
		FROM zcash_scan_data WHERE public_key_ecdsa = ?`

	row := s.db.QueryRow(query, publicKeyECDSA)

	var data ZcashScanData
	var scanHeight, scanTarget, birthHeight sql.NullInt64

	err := row.Scan(
		&data.ZAddress,
		&data.PublicKeyECDSA,
		&scanHeight,
		&scanTarget,
		&birthHeight,
		&data.BirthdayScanDone,
		&data.PubKeyPackage,
		&data.SaplingExtras,
		&data.NotesJSON,
		&data.NullifierVersion,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("could not get zcash scan data: %w", err)
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

	return &data, nil
}

func (s *Store) SaveZcashScanData(data *ZcashScanData) error {
	columns := []string{
		"z_address",
		"public_key_ecdsa",
		"scan_height",
		"scan_target",
		"birth_height",
		"birthday_scan_done",
		"pub_key_package",
		"sapling_extras",
		"notes_json",
		"nullifier_version",
	}

	query := fmt.Sprintf(`INSERT OR REPLACE INTO zcash_scan_data (%s) VALUES (%s)`,
		strings.Join(columns, ", "),
		generatePlaceholders(len(columns)))

	_, err := s.db.Exec(query,
		data.ZAddress,
		data.PublicKeyECDSA,
		data.ScanHeight,
		data.ScanTarget,
		data.BirthHeight,
		data.BirthdayScanDone,
		data.PubKeyPackage,
		data.SaplingExtras,
		data.NotesJSON,
		data.NullifierVersion,
	)
	if err != nil {
		return fmt.Errorf("could not save zcash scan data: %w", err)
	}

	return nil
}
