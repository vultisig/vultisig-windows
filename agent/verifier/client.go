package verifier

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	rtypes "github.com/vultisig/recipes/types"
	"google.golang.org/protobuf/encoding/protojson"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type APIResponse struct {
	Data  json.RawMessage `json:"data"`
	Error *APIError       `json:"error,omitempty"`
}

type APIError struct {
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

type AppPricing struct {
	ID        string  `json:"id"`
	PluginID  string  `json:"pluginId"`
	Amount    float64 `json:"amount"`
	Asset     string  `json:"asset"`
	Type      string  `json:"type"`
	Frequency string  `json:"frequency"`
	Metric    string  `json:"metric"`
}

type Plugin struct {
	ID            string       `json:"id"`
	Title         string       `json:"title"`
	Description   string       `json:"description"`
	Logo          string       `json:"logo,omitempty"`
	Categories    []string     `json:"categories,omitempty"`
	Version       string       `json:"version,omitempty"`
	PluginVersion string       `json:"plugin_version,omitempty"`
	Author        string       `json:"author,omitempty"`
	Pricing       []AppPricing `json:"pricing,omitempty"`
}

type PluginListResponse struct {
	Plugins    []Plugin `json:"plugins"`
	TotalCount int      `json:"total_count"`
}

type RecipeSpecification struct {
	Description          string         `json:"description"`
	ConfigurationSchema  map[string]any `json:"configuration_schema"`
	ConfigurationExample any            `json:"configuration_example,omitempty"`
	SupportedChains      []string       `json:"supported_chains,omitempty"`
	SupportedAssets      []string       `json:"supported_assets,omitempty"`
	RequiredFields       []string       `json:"required_fields,omitempty"`
}

type Policy struct {
	ID            string         `json:"id"`
	PluginID      string         `json:"plugin_id"`
	PublicKey     string         `json:"public_key"`
	Name          string         `json:"name,omitempty"`
	Active        bool           `json:"active"`
	Configuration map[string]any `json:"configuration"`
	Recipe        string         `json:"recipe,omitempty"`
	CreatedAt     string         `json:"created_at"`
	UpdatedAt     string         `json:"updated_at,omitempty"`
}

type PolicyDetails struct {
	ID            string `json:"id"`
	Recipe        string `json:"recipe"`
	PublicKey     string `json:"public_key"`
	PolicyVersion int    `json:"policy_version"`
	PluginVersion string `json:"plugin_version"`
}

type PolicyListResponse struct {
	Policies   []Policy `json:"policies"`
	TotalCount int      `json:"total_count"`
}

type PolicyAddRequest struct {
	PluginID      string `json:"plugin_id"`
	PublicKey     string `json:"public_key"`
	PluginVersion string `json:"plugin_version"`
	PolicyVersion int    `json:"policy_version"`
	Signature     string `json:"signature"`
	Recipe        string `json:"recipe"`
	Billing       []any  `json:"billing,omitempty"`
	Active        bool   `json:"active"`
}

type PolicyAddResponse struct {
	ID string `json:"id"`
}

type Transaction struct {
	ID          string `json:"id"`
	PolicyID    string `json:"policy_id"`
	TxHash      string `json:"tx_hash"`
	Status      string `json:"status"`
	ChainStatus string `json:"status_onchain,omitempty"`
	CreatedAt   string `json:"created_at"`
}

type TransactionListResponse struct {
	History    []Transaction `json:"history"`
	TotalCount int           `json:"total_count"`
}

func (c *Client) ListPlugins() (*PluginListResponse, error) {
	resp, err := c.get("/plugins")
	if err != nil {
		return nil, err
	}

	var result PluginListResponse
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal plugins: %w", err)
	}

	return &result, nil
}

func (c *Client) GetPlugin(pluginID string) (*Plugin, error) {
	resp, err := c.get("/plugins/" + pluginID)
	if err != nil {
		return nil, err
	}

	var result Plugin
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal plugin: %w", err)
	}

	return &result, nil
}

func (c *Client) GetRecipeSpecification(pluginID string) (*RecipeSpecification, error) {
	resp, err := c.get("/plugins/" + pluginID + "/recipe-specification")
	if err != nil {
		return nil, err
	}

	var result RecipeSpecification
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal recipe spec: %w", err)
	}

	return &result, nil
}

func (c *Client) CheckPluginInstalled(pluginID, publicKey, authToken string) (bool, error) {
	_, err := c.getWithAuth("/vault/exist/"+pluginID+"/"+publicKey, authToken)
	if err != nil {
		msg := strings.ToLower(err.Error())
		if strings.Contains(msg, "status 404") || strings.Contains(msg, "not found") {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (c *Client) SuggestPolicy(pluginID string, configuration map[string]any) (*rtypes.PolicySuggest, error) {
	body := map[string]any{
		"configuration": configuration,
	}

	resp, err := c.post("/plugins/"+pluginID+"/recipe-specification/suggest", body, "")
	if err != nil {
		return nil, err
	}

	var result rtypes.PolicySuggest
	err = protojson.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal policy suggest: %w", err)
	}

	return &result, nil
}

func (c *Client) ListPolicies(pluginID, publicKey, authToken string, active bool) (*PolicyListResponse, error) {
	url := fmt.Sprintf("/plugin/policies/%s?public_key=%s&active=%t", pluginID, publicKey, active)
	resp, err := c.getWithAuth(url, authToken)
	if err != nil {
		return nil, err
	}

	var result PolicyListResponse
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal policies: %w", err)
	}

	return &result, nil
}

func (c *Client) AddPolicy(req *PolicyAddRequest, authToken string) (*PolicyAddResponse, error) {
	body := map[string]any{
		"plugin_id":      req.PluginID,
		"public_key":     req.PublicKey,
		"plugin_version": req.PluginVersion,
		"policy_version": req.PolicyVersion,
		"signature":      req.Signature,
		"recipe":         req.Recipe,
		"active":         req.Active,
	}
	if len(req.Billing) > 0 {
		body["billing"] = req.Billing
	}

	resp, err := c.post("/plugin/policy", body, authToken)
	if err != nil {
		return nil, err
	}

	var result PolicyAddResponse
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal policy response: %w", err)
	}

	return &result, nil
}

func (c *Client) DeletePolicy(policyID, signature, authToken string) error {
	body := map[string]any{
		"signature": signature,
	}

	_, err := c.delete("/plugin/policy/"+policyID, body, authToken)
	return err
}

func (c *Client) GetPolicy(policyID, authToken string) (*PolicyDetails, error) {
	resp, err := c.getWithAuth("/plugin/policy/"+policyID, authToken)
	if err != nil {
		return nil, err
	}

	var result PolicyDetails
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal policy: %w", err)
	}

	return &result, nil
}

func (c *Client) UninstallPlugin(pluginID, authToken string) error {
	_, err := c.delete("/plugin/"+pluginID, map[string]any{}, authToken)
	return err
}

func (c *Client) GetPolicyFull(policyID, authToken string) (*Policy, error) {
	resp, err := c.getWithAuth("/plugin/policy/"+policyID, authToken)
	if err != nil {
		return nil, err
	}

	var result Policy
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal policy: %w", err)
	}

	return &result, nil
}

func (c *Client) GetTransactions(publicKey, authToken string) (*TransactionListResponse, error) {
	resp, err := c.getWithAuth("/plugin/transactions?public_key="+publicKey, authToken)
	if err != nil {
		return nil, err
	}

	var result TransactionListResponse
	err = json.Unmarshal(resp, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal transactions: %w", err)
	}

	return &result, nil
}

func (c *Client) ValidateToken(accessToken string) error {
	_, err := c.getWithAuth("/auth/me", accessToken)
	return err
}

func (c *Client) RevokeAllTokens(accessToken string) error {
	_, err := c.delete("/auth/tokens/all", map[string]any{}, accessToken)
	return err
}

func (c *Client) get(path string) (json.RawMessage, error) {
	return c.getWithAuth(path, "")
}

func (c *Client) getWithAuth(path, authToken string) (json.RawMessage, error) {
	req, err := http.NewRequest(http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", bearerAuth(authToken))
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var apiResp APIResponse
	err = json.Unmarshal(body, &apiResp)
	if err != nil {
		return body, nil
	}

	if apiResp.Error != nil && apiResp.Error.Message != "" {
		return nil, fmt.Errorf("API error: %s", apiResp.Error.Message)
	}

	if apiResp.Data != nil {
		return apiResp.Data, nil
	}

	return body, nil
}

func (c *Client) post(path string, body map[string]any, authToken string) (json.RawMessage, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal body: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, c.baseURL+path, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", bearerAuth(authToken))
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var apiResp APIResponse
	err = json.Unmarshal(respBody, &apiResp)
	if err != nil {
		return respBody, nil
	}

	if apiResp.Error != nil && apiResp.Error.Message != "" {
		return nil, fmt.Errorf("API error: %s", apiResp.Error.Message)
	}

	if apiResp.Data != nil {
		return apiResp.Data, nil
	}

	return respBody, nil
}

func (c *Client) delete(path string, body map[string]any, authToken string) (json.RawMessage, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal body: %w", err)
	}

	req, err := http.NewRequest(http.MethodDelete, c.baseURL+path, bytes.NewReader(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", bearerAuth(authToken))
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func bearerAuth(token string) string {
	t := strings.TrimSpace(token)
	if t == "" {
		return ""
	}
	if strings.HasPrefix(strings.ToLower(t), "bearer ") {
		return "Bearer " + strings.TrimSpace(t[7:])
	}
	return "Bearer " + t
}
