package chainbridge

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const defaultDeriveTimeout = 30 * time.Second

type DeriveAddressRequest struct {
	RequestID   string `json:"requestId"`
	VaultPubKey string `json:"vaultPubKey"`
	Chain       string `json:"chain"`
}

type DeriveAddressResponse struct {
	RequestID string `json:"requestId"`
	Chain     string `json:"chain"`
	Address   string `json:"address"`
	Error     string `json:"error,omitempty"`
}

var (
	pendingMu sync.Mutex
	pending   = make(map[string]chan DeriveAddressResponse)
)

func RequestDeriveAddress(appCtx, waitCtx context.Context, req DeriveAddressRequest) (*DeriveAddressResponse, error) {
	if waitCtx == nil {
		waitCtx = context.Background()
	}
	if appCtx == nil {
		appCtx = waitCtx
	}

	req.RequestID = uuid.New().String()
	respCh := make(chan DeriveAddressResponse, 1)

	pendingMu.Lock()
	pending[req.RequestID] = respCh
	pendingMu.Unlock()

	defer func() {
		pendingMu.Lock()
		delete(pending, req.RequestID)
		pendingMu.Unlock()
	}()

	runtime.EventsEmit(appCtx, "agent:chain:derive_address", req)

	timeout := time.NewTimer(defaultDeriveTimeout)
	defer timeout.Stop()

	select {
	case <-waitCtx.Done():
		return nil, waitCtx.Err()
	case <-timeout.C:
		return nil, fmt.Errorf("timeout waiting for address derivation response")
	case resp := <-respCh:
		if strings.TrimSpace(resp.Error) != "" {
			return nil, errors.New(resp.Error)
		}
		if resp.Address == "" {
			return nil, fmt.Errorf("invalid derive address response: missing address")
		}
		return &resp, nil
	}
}

func SubmitDeriveAddressResponse(resp DeriveAddressResponse) error {
	if strings.TrimSpace(resp.RequestID) == "" {
		return fmt.Errorf("requestId is required")
	}

	pendingMu.Lock()
	respCh, ok := pending[resp.RequestID]
	pendingMu.Unlock()
	if !ok {
		return fmt.Errorf("no pending derive address request for requestId=%s", resp.RequestID)
	}

	select {
	case respCh <- resp:
		return nil
	default:
		return fmt.Errorf("failed to submit derive address response")
	}
}
