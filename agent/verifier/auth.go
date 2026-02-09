package verifier

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/decred/dcrd/dcrec/secp256k1/v4"
	"golang.org/x/crypto/sha3"
)

type AuthRequest struct {
	Message      string `json:"message"`
	Signature    string `json:"signature"`
	ChainCodeHex string `json:"chain_code_hex"`
	PublicKey    string `json:"public_key"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

type AuthToken struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}

func GenerateAuthMessage(publicKey string) (string, error) {
	nonce := make([]byte, 16)
	_, err := rand.Read(nonce)
	if err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	address, err := deriveEthereumAddress(publicKey)
	if err != nil {
		return "", fmt.Errorf("failed to derive ethereum address: %w", err)
	}

	// Keep auth message contract aligned with extension/plugin-marketplace sign-in flow.
	messageObj := map[string]string{
		"message":   "Sign into Vultisig App Store",
		"nonce":     hex.EncodeToString(nonce),
		"expiresAt": time.Now().Add(15 * time.Minute).Format(time.RFC3339),
		"address":   address,
	}
	messageJSON, err := json.Marshal(messageObj)
	if err != nil {
		return "", fmt.Errorf("failed to marshal auth message: %w", err)
	}
	return string(messageJSON), nil
}

func deriveEthereumAddress(publicKey string) (string, error) {
	normalized := strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(publicKey), "0x"), "0X")
	pubKeyBytes, err := hex.DecodeString(normalized)
	if err != nil {
		return "", fmt.Errorf("decode public key: %w", err)
	}

	parsed, err := secp256k1.ParsePubKey(pubKeyBytes)
	if err != nil {
		return "", fmt.Errorf("parse public key: %w", err)
	}

	uncompressed := parsed.SerializeUncompressed()
	hasher := sha3.NewLegacyKeccak256()
	hasher.Write(uncompressed[1:]) // Drop the 0x04 prefix.
	sum := hasher.Sum(nil)
	return "0x" + hex.EncodeToString(sum[12:]), nil
}

const defaultTokenTTL = 7 * 24 * time.Hour

func (c *Client) RefreshToken(currentToken string) (*AuthToken, error) {
	body := map[string]any{
		"token": currentToken,
	}

	resp, err := c.post("/auth/refresh", body, currentToken)
	if err != nil {
		return nil, fmt.Errorf("token refresh failed: %w", err)
	}

	tokenValue, expiresAt, err := extractAuthTokenFromResponse(resp)
	if err != nil {
		return nil, fmt.Errorf("parse refresh response: %w (payload=%s)", err, string(resp))
	}

	if expiresAt.IsZero() {
		expiresAt = time.Now().Add(defaultTokenTTL)
	}

	return &AuthToken{
		Token:     tokenValue,
		ExpiresAt: expiresAt,
	}, nil
}

func (c *Client) Authenticate(publicKey, chainCodeHex, signature, message string) (*AuthToken, error) {
	body := map[string]any{
		"message":        message,
		"signature":      signature,
		"chain_code_hex": chainCodeHex,
		"public_key":     publicKey,
	}

	resp, err := c.post("/auth", body, "")
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}
	tokenValue, expiresAt, err := extractAuthTokenFromResponse(resp)
	if err != nil {
		return nil, fmt.Errorf("parse auth response: %w (payload=%s)", err, string(resp))
	}

	if expiresAt.IsZero() {
		expiresAt = time.Now().Add(defaultTokenTTL)
	}

	return &AuthToken{
		Token:     tokenValue,
		ExpiresAt: expiresAt,
	}, nil
}

func extractAuthTokenFromResponse(body []byte) (string, time.Time, error) {
	var payload map[string]any
	unmarshalErr := json.Unmarshal(body, &payload)
	if unmarshalErr != nil {
		return "", time.Time{}, unmarshalErr
	}

	var token string
	var expiresAt time.Time

	if data, ok := payload["data"].(map[string]any); ok {
		token = extractStringField(data, "token", "access_token", "jwt")
		expiresAt = extractExpiryField(data)
	}

	if token == "" {
		token = extractStringField(payload, "token", "access_token", "jwt")
	}
	if expiresAt.IsZero() {
		expiresAt = extractExpiryField(payload)
	}

	if token == "" {
		return "", time.Time{}, fmt.Errorf("auth response missing token")
	}

	return token, expiresAt, nil
}

func extractStringField(m map[string]any, keys ...string) string {
	for _, key := range keys {
		val, ok := m[key].(string)
		if ok && val != "" {
			return val
		}
	}
	return ""
}

func extractExpiryField(m map[string]any) time.Time {
	for _, key := range []string{"expires_at", "expiresAt", "expires"} {
		switch v := m[key].(type) {
		case string:
			t, err := time.Parse(time.RFC3339, v)
			if err == nil {
				return t
			}
		case float64:
			if v > 1e9 {
				return time.Unix(int64(v), 0)
			}
		}
	}

	if exp, ok := m["exp"].(float64); ok && exp > 1e9 {
		return time.Unix(int64(exp), 0)
	}

	return time.Time{}
}
