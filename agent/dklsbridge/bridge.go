package dklsbridge

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

const defaultRequestTimeout = 2 * time.Minute

type SignRequest struct {
	RequestID          string   `json:"requestId"`
	VaultPubKey        string   `json:"vaultPubKey"`
	Message            string   `json:"message"`
	DerivePath         string   `json:"derivePath"`
	SessionID          string   `json:"sessionId"`
	HexEncryptionKey   string   `json:"hexEncryptionKey"`
	RelayURL           string   `json:"relayUrl"`
	LocalPartyID       string   `json:"localPartyId"`
	Peers              []string `json:"peers"`
	KeyShare           string   `json:"keyShare"`
	SignatureAlgorithm string   `json:"signatureAlgorithm"`
}

type SignResponse struct {
	RequestID  string `json:"requestId"`
	R          string `json:"r"`
	S          string `json:"s"`
	RecoveryID string `json:"recoveryId"`
	Error      string `json:"error,omitempty"`
}

var (
	pendingMu sync.Mutex
	pending   = make(map[string]chan SignResponse)
)

func RequestSign(appCtx, waitCtx context.Context, req SignRequest) (*SignResponse, error) {
	if waitCtx == nil {
		waitCtx = context.Background()
	}
	if appCtx == nil {
		appCtx = waitCtx
	}

	req.RequestID = uuid.New().String()
	if req.SignatureAlgorithm == "" {
		req.SignatureAlgorithm = "ecdsa"
	}
	respCh := make(chan SignResponse, 1)

	pendingMu.Lock()
	pending[req.RequestID] = respCh
	pendingMu.Unlock()

	defer func() {
		pendingMu.Lock()
		delete(pending, req.RequestID)
		pendingMu.Unlock()
	}()

	runtime.EventsEmit(appCtx, "agent:dkls_sign_request", req)

	timeout := time.NewTimer(defaultRequestTimeout)
	defer timeout.Stop()

	select {
	case <-waitCtx.Done():
		return nil, waitCtx.Err()
	case <-timeout.C:
		return nil, fmt.Errorf("timeout waiting for DKLS signature response")
	case resp := <-respCh:
		if strings.TrimSpace(resp.Error) != "" {
			return nil, errors.New(resp.Error)
		}
		if resp.R == "" || resp.S == "" {
			return nil, fmt.Errorf("invalid DKLS signature response: missing r/s")
		}
		return &resp, nil
	}
}

func SubmitSignResponse(resp SignResponse) error {
	if strings.TrimSpace(resp.RequestID) == "" {
		return fmt.Errorf("requestId is required")
	}

	pendingMu.Lock()
	respCh, ok := pending[resp.RequestID]
	pendingMu.Unlock()
	if !ok {
		return fmt.Errorf("no pending DKLS signing request for requestId=%s", resp.RequestID)
	}

	select {
	case respCh <- resp:
		return nil
	default:
		return fmt.Errorf("failed to submit DKLS signature response")
	}
}
