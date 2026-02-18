package toolbridge

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const defaultTimeout = 30 * time.Second

type CoinInfo struct {
	Chain           string `json:"chain"`
	Ticker          string `json:"ticker"`
	Address         string `json:"address"`
	ContractAddress string `json:"contractAddress,omitempty"`
	Decimals        int    `json:"decimals"`
	Logo            string `json:"logo,omitempty"`
	PriceProviderID string `json:"priceProviderId,omitempty"`
	IsNativeToken   bool   `json:"isNativeToken"`
}

type ToolRequest struct {
	RequestID string         `json:"requestId"`
	ToolName  string         `json:"toolName"`
	Input     map[string]any `json:"input"`
	Context   ToolContext    `json:"context"`
}

type ToolContext struct {
	VaultPubKey string     `json:"vaultPubKey"`
	VaultName   string     `json:"vaultName"`
	AuthToken   string     `json:"authToken,omitempty"`
	Coins       []CoinInfo `json:"coins"`
}

type ToolResponse struct {
	RequestID     string `json:"requestId"`
	Result        string `json:"result,omitempty"`
	Error         string `json:"error,omitempty"`
	VaultModified bool   `json:"vaultModified,omitempty"`
}

var (
	pendingMu sync.Mutex
	pending   = make(map[string]chan ToolResponse)
)

func RequestToolExecution(appCtx, waitCtx context.Context, req ToolRequest) (*ToolResponse, error) {
	if waitCtx == nil {
		waitCtx = context.Background()
	}
	if appCtx == nil {
		appCtx = waitCtx
	}

	req.RequestID = uuid.New().String()

	respCh := make(chan ToolResponse, 1)

	pendingMu.Lock()
	pending[req.RequestID] = respCh
	pendingMu.Unlock()

	defer func() {
		pendingMu.Lock()
		delete(pending, req.RequestID)
		pendingMu.Unlock()
	}()

	runtime.EventsEmit(appCtx, "agent:tool:request", req)

	timeout := time.NewTimer(defaultTimeout)
	defer timeout.Stop()

	select {
	case <-waitCtx.Done():
		return nil, waitCtx.Err()
	case <-timeout.C:
		return nil, fmt.Errorf("timeout waiting for tool execution: %s", req.ToolName)
	case resp := <-respCh:
		if strings.TrimSpace(resp.Error) != "" {
			return nil, errors.New(resp.Error)
		}
		return &resp, nil
	}
}

func SubmitToolResponse(respJSON string) error {
	var resp ToolResponse
	err := json.Unmarshal([]byte(respJSON), &resp)
	if err != nil {
		return fmt.Errorf("failed to unmarshal tool response: %w", err)
	}

	if strings.TrimSpace(resp.RequestID) == "" {
		return fmt.Errorf("requestId is required")
	}

	pendingMu.Lock()
	respCh, ok := pending[resp.RequestID]
	pendingMu.Unlock()
	if !ok {
		return fmt.Errorf("no pending tool request for requestId=%s", resp.RequestID)
	}

	select {
	case respCh <- resp:
		return nil
	default:
		return fmt.Errorf("failed to submit tool response")
	}
}
