package storage

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
)

func (s *Store) SaveAgentAuthToken(vaultPubKey, token, refreshToken string, expiresAt time.Time) error {
	if vaultPubKey == "" {
		return fmt.Errorf("vault public key is required")
	}
	if token == "" {
		return fmt.Errorf("token is required")
	}
	if expiresAt.IsZero() {
		return fmt.Errorf("expiresAt is required")
	}

	query := `
		INSERT INTO agent_auth_tokens (public_key_ecdsa, token, refresh_token, expires_at, updated_at)
		VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(public_key_ecdsa)
		DO UPDATE SET token = excluded.token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at, updated_at = CURRENT_TIMESTAMP
	`
	_, err := s.db.Exec(query, vaultPubKey, token, refreshToken, expiresAt.UTC())
	if err != nil {
		return fmt.Errorf("could not save agent auth token: %w", err)
	}
	return nil
}

func (s *Store) GetAgentAuthToken(vaultPubKey string) (string, string, time.Time, error) {
	if vaultPubKey == "" {
		return "", "", time.Time{}, fmt.Errorf("vault public key is required")
	}

	query := `SELECT token, refresh_token, expires_at FROM agent_auth_tokens WHERE public_key_ecdsa = ?`
	var token string
	var refreshToken string
	var expiresAt time.Time
	err := s.db.QueryRow(query, vaultPubKey).Scan(&token, &refreshToken, &expiresAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", "", time.Time{}, fmt.Errorf("agent auth token not found")
		}
		return "", "", time.Time{}, fmt.Errorf("could not get agent auth token: %w", err)
	}

	return token, refreshToken, expiresAt.UTC(), nil
}

func (s *Store) DeleteAgentAuthToken(vaultPubKey string) error {
	if vaultPubKey == "" {
		return fmt.Errorf("vault public key is required")
	}

	_, err := s.db.Exec(`DELETE FROM agent_auth_tokens WHERE public_key_ecdsa = ?`, vaultPubKey)
	if err != nil {
		return fmt.Errorf("could not delete agent auth token: %w", err)
	}
	return nil
}
