package portfoliobridge

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

type PortfolioRequest struct {
	RequestID   string `json:"requestId"`
	VaultPubKey string `json:"vaultPubKey"`
}

type CoinValue struct {
	Chain    string  `json:"chain"`
	Ticker   string  `json:"ticker"`
	Balance  string  `json:"balance"`
	ValueUSD float64 `json:"value_usd"`
	PriceUSD float64 `json:"price_usd"`
	Logo     string  `json:"logo,omitempty"`
}

type ChainValue struct {
	Chain    string  `json:"chain"`
	ValueUSD float64 `json:"value_usd"`
}

type PortfolioResponse struct {
	RequestID    string       `json:"requestId"`
	TotalUSD     float64      `json:"total_usd"`
	Chains       []ChainValue `json:"chains"`
	Coins        []CoinValue  `json:"coins"`
	Error        string       `json:"error,omitempty"`
}

var (
	pendingMu sync.Mutex
	pending   = make(map[string]chan PortfolioResponse)
)

func RequestPortfolio(appCtx, waitCtx context.Context, vaultPubKey string) (*PortfolioResponse, error) {
	if waitCtx == nil {
		waitCtx = context.Background()
	}
	if appCtx == nil {
		appCtx = waitCtx
	}

	req := PortfolioRequest{
		RequestID:   uuid.New().String(),
		VaultPubKey: vaultPubKey,
	}

	respCh := make(chan PortfolioResponse, 1)

	pendingMu.Lock()
	pending[req.RequestID] = respCh
	pendingMu.Unlock()

	defer func() {
		pendingMu.Lock()
		delete(pending, req.RequestID)
		pendingMu.Unlock()
	}()

	runtime.EventsEmit(appCtx, "agent:portfolio:request", req)

	timeout := time.NewTimer(defaultTimeout)
	defer timeout.Stop()

	select {
	case <-waitCtx.Done():
		return nil, waitCtx.Err()
	case <-timeout.C:
		return nil, fmt.Errorf("timeout waiting for portfolio data")
	case resp := <-respCh:
		if strings.TrimSpace(resp.Error) != "" {
			return nil, errors.New(resp.Error)
		}
		return &resp, nil
	}
}

func SubmitPortfolioResponse(respJSON string) error {
	var resp PortfolioResponse
	err := json.Unmarshal([]byte(respJSON), &resp)
	if err != nil {
		return fmt.Errorf("failed to unmarshal portfolio response: %w", err)
	}

	if strings.TrimSpace(resp.RequestID) == "" {
		return fmt.Errorf("requestId is required")
	}

	pendingMu.Lock()
	respCh, ok := pending[resp.RequestID]
	pendingMu.Unlock()
	if !ok {
		return fmt.Errorf("no pending portfolio request for requestId=%s", resp.RequestID)
	}

	select {
	case respCh <- resp:
		return nil
	default:
		return fmt.Errorf("failed to submit portfolio response")
	}
}
