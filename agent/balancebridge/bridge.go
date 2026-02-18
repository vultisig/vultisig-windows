package balancebridge

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

type BalanceRequest struct {
	RequestID string `json:"requestId"`
	Chain     string `json:"chain"`
	Address   string `json:"address"`
	ID        string `json:"id"`
}

type BalanceResponse struct {
	RequestID string `json:"requestId"`
	Balance   string `json:"balance"`
	Error     string `json:"error,omitempty"`
}

var (
	pendingMu sync.Mutex
	pending   = make(map[string]chan BalanceResponse)
)

func RequestBalance(appCtx, waitCtx context.Context, req BalanceRequest) (*BalanceResponse, error) {
	if waitCtx == nil {
		waitCtx = context.Background()
	}
	if appCtx == nil {
		appCtx = waitCtx
	}

	req.RequestID = uuid.New().String()

	respCh := make(chan BalanceResponse, 1)

	pendingMu.Lock()
	pending[req.RequestID] = respCh
	pendingMu.Unlock()

	defer func() {
		pendingMu.Lock()
		delete(pending, req.RequestID)
		pendingMu.Unlock()
	}()

	runtime.EventsEmit(appCtx, "agent:balance:request", req)

	timeout := time.NewTimer(defaultTimeout)
	defer timeout.Stop()

	select {
	case <-waitCtx.Done():
		return nil, waitCtx.Err()
	case <-timeout.C:
		return nil, fmt.Errorf("timeout waiting for balance data")
	case resp := <-respCh:
		if strings.TrimSpace(resp.Error) != "" {
			return nil, errors.New(resp.Error)
		}
		return &resp, nil
	}
}

func SubmitBalanceResponse(respJSON string) error {
	var resp BalanceResponse
	err := json.Unmarshal([]byte(respJSON), &resp)
	if err != nil {
		return fmt.Errorf("failed to unmarshal balance response: %w", err)
	}

	if strings.TrimSpace(resp.RequestID) == "" {
		return fmt.Errorf("requestId is required")
	}

	pendingMu.Lock()
	respCh, ok := pending[resp.RequestID]
	pendingMu.Unlock()
	if !ok {
		return fmt.Errorf("no pending balance request for requestId=%s", resp.RequestID)
	}

	select {
	case respCh <- resp:
		return nil
	default:
		return fmt.Errorf("failed to submit balance response")
	}
}
