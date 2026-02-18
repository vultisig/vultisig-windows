package verifier

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/decred/dcrd/dcrec/secp256k1/v4"
	"golang.org/x/crypto/sha3"
)

type AuthToken struct {
	Token        string
	RefreshToken string
	ExpiresAt    time.Time
}

type tokenPairResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
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
		"message":   "Sign into Vultisig Plugin Marketplace",
		"nonce":     "0x" + hex.EncodeToString(nonce),
		"expiresAt": time.Now().UTC().Add(15 * time.Minute).Format("2006-01-02T15:04:05.000Z"),
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

func (c *Client) RefreshToken(refreshToken string) (*AuthToken, error) {
	body := map[string]any{
		"refresh_token": refreshToken,
	}

	resp, err := c.post("/auth/refresh", body, "")
	if err != nil {
		return nil, fmt.Errorf("token refresh failed: %w", err)
	}

	return parseTokenPairResponse(resp)
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

	return parseTokenPairResponse(resp)
}

func parseTokenPairResponse(body []byte) (*AuthToken, error) {
	var pair tokenPairResponse
	err := json.Unmarshal(body, &pair)
	if err != nil {
		return nil, fmt.Errorf("unmarshal token response: %w", err)
	}

	if pair.AccessToken == "" {
		return nil, fmt.Errorf("auth response missing access_token")
	}

	var expiresAt time.Time
	if pair.ExpiresIn > 0 {
		expiresAt = time.Now().Add(time.Duration(pair.ExpiresIn) * time.Second)
	}
	if expiresAt.IsZero() {
		expiresAt = ParseJWTExpiry(pair.AccessToken)
	}
	if expiresAt.IsZero() {
		return nil, fmt.Errorf("could not determine token expiry")
	}

	return &AuthToken{
		Token:        pair.AccessToken,
		RefreshToken: pair.RefreshToken,
		ExpiresAt:    expiresAt,
	}, nil
}

func ParseJWTExpiry(token string) time.Time {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return time.Time{}
	}

	payload := parts[1]
	switch len(payload) % 4 {
	case 2:
		payload += "=="
	case 3:
		payload += "="
	}

	decoded, err := base64.URLEncoding.DecodeString(payload)
	if err != nil {
		return time.Time{}
	}

	var claims map[string]any
	err = json.Unmarshal(decoded, &claims)
	if err != nil {
		return time.Time{}
	}

	exp, ok := claims["exp"].(float64)
	if !ok || exp < 1e9 {
		return time.Time{}
	}
	return time.Unix(int64(exp), 0)
}
