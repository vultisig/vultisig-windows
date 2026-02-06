package rpc

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const vultisigAPIBase = "https://api.vultisig.com"

var httpClient = &http.Client{Timeout: 15 * time.Second}

func GetJSON(url string, result any) error {
	resp, err := httpClient.Get(url)
	if err != nil {
		return fmt.Errorf("HTTP GET failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	err = json.Unmarshal(body, result)
	if err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}

func PostJSON(url string, payload any, result any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := httpClient.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("HTTP POST failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	err = json.Unmarshal(respBody, result)
	if err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}
