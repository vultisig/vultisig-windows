package verifier

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"
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

func GenerateAuthMessage() (string, error) {
	nonce := make([]byte, 16)
	_, err := rand.Read(nonce)
	if err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	timestamp := time.Now().Unix()
	message := fmt.Sprintf("%s:%d", hex.EncodeToString(nonce), timestamp)
	return message, nil
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

	var authResp AuthResponse
	err = json.Unmarshal(resp, &authResp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse auth response: %w", err)
	}

	return &AuthToken{
		Token:     authResp.Token,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}, nil
}
