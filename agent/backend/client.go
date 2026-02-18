package backend

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var ErrUnauthorized = errors.New("unauthorized")

const (
	DefaultBaseURL = "https://agent-backend.vultisig.com"
	envBaseURL     = "AGENT_BACKEND_URL"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient() *Client {
	baseURL := os.Getenv(envBaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

func (c *Client) BaseURL() string {
	return c.baseURL
}

func (c *Client) CreateConversation(ctx context.Context, publicKey, token string, title *string) (*Conversation, error) {
	body := CreateConversationRequest{PublicKey: publicKey, Title: title}
	var conv Conversation
	err := c.doRequest(ctx, http.MethodPost, "/agent/conversations", token, body, &conv)
	if err != nil {
		return nil, fmt.Errorf("create conversation: %w", err)
	}
	return &conv, nil
}

func (c *Client) SendMessage(ctx context.Context, convID string, req *SendMessageRequest, token string) (*SendMessageResponse, error) {
	path := fmt.Sprintf("/agent/conversations/%s/messages", convID)
	var resp SendMessageResponse
	err := c.doRequest(ctx, http.MethodPost, path, token, req, &resp)
	if err != nil {
		return nil, fmt.Errorf("send message: %w", err)
	}
	return &resp, nil
}

func (c *Client) ListConversations(ctx context.Context, publicKey string, skip, take int, token string) (*ListConversationsResponse, error) {
	body := ListConversationsRequest{
		PublicKey: publicKey,
		Skip:      skip,
		Take:      take,
	}
	var resp ListConversationsResponse
	err := c.doRequest(ctx, http.MethodPost, "/agent/conversations/list", token, body, &resp)
	if err != nil {
		return nil, fmt.Errorf("list conversations: %w", err)
	}
	return &resp, nil
}

func (c *Client) GetConversation(ctx context.Context, convID, publicKey, token string) (*ConversationWithMessages, error) {
	path := fmt.Sprintf("/agent/conversations/%s", convID)
	body := struct {
		PublicKey string `json:"public_key"`
	}{PublicKey: publicKey}
	var resp ConversationWithMessages
	err := c.doRequest(ctx, http.MethodPost, path, token, body, &resp)
	if err != nil {
		return nil, fmt.Errorf("get conversation: %w", err)
	}
	return &resp, nil
}

func (c *Client) DeleteConversation(ctx context.Context, convID, publicKey, token string) error {
	path := fmt.Sprintf("/agent/conversations/%s", convID)
	body := struct {
		PublicKey string `json:"public_key"`
	}{PublicKey: publicKey}
	err := c.doRequest(ctx, http.MethodDelete, path, token, body, nil)
	if err != nil {
		return fmt.Errorf("delete conversation: %w", err)
	}
	return nil
}

func (c *Client) BuildSwapQuote(ctx context.Context, convID string, req *BuildSwapQuoteRequest, token string) (*BuildSwapQuoteResponse, error) {
	path := fmt.Sprintf("/agent/conversations/%s/swap/build", convID)
	var resp BuildSwapQuoteResponse
	err := c.doRequest(ctx, http.MethodPost, path, token, req, &resp)
	if err != nil {
		return nil, fmt.Errorf("build swap quote: %w", err)
	}
	if resp.Error != "" && len(resp.Actions) == 0 {
		return nil, fmt.Errorf("build swap quote: %s", resp.Error)
	}
	return &resp, nil
}

func (c *Client) doRequest(ctx context.Context, method, path, token string, reqBody any, respBody any) error {
	var bodyReader io.Reader
	if reqBody != nil {
		data, err := json.Marshal(reqBody)
		if err != nil {
			return fmt.Errorf("marshal request: %w", err)
		}
		bodyReader = bytes.NewReader(data)
	}

	httpReq, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bodyReader)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if token != "" {
		httpReq.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode == http.StatusUnauthorized {
		return ErrUnauthorized
	}

	if resp.StatusCode >= 400 {
		var apiErr ErrorResponse
		if err := json.Unmarshal(respData, &apiErr); err != nil {
			return fmt.Errorf("status %d: %s", resp.StatusCode, string(respData))
		}
		return fmt.Errorf("status %d: %s", resp.StatusCode, apiErr.Error)
	}

	if respBody != nil {
		if err := json.Unmarshal(respData, respBody); err != nil {
			return fmt.Errorf("unmarshal response: %w", err)
		}
	}

	return nil
}
