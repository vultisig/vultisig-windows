package dklsbridge

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const defaultReshareTimeout = 5 * time.Minute

type ReshareRequest struct {
	RequestID        string   `json:"requestId"`
	VaultPubKey      string   `json:"vaultPubKey"`
	SessionID        string   `json:"sessionId"`
	HexEncryptionKey string   `json:"hexEncryptionKey"`
	RelayURL         string   `json:"relayUrl"`
	LocalPartyID     string   `json:"localPartyId"`
	Peers            []string `json:"peers"`
	OldParties       []string `json:"oldParties"`
	EcdsaKeyshare    string   `json:"ecdsaKeyshare"`
	EddsaKeyshare    string   `json:"eddsaKeyshare"`
}

type ReshareResponse struct {
	RequestID      string `json:"requestId"`
	EcdsaPubKey    string `json:"ecdsaPubKey"`
	EddsaPubKey    string `json:"eddsaPubKey"`
	EcdsaKeyshare  string `json:"ecdsaKeyshare"`
	EddsaKeyshare  string `json:"eddsaKeyshare"`
	HexChainCode   string `json:"hexChainCode"`
	Error          string `json:"error,omitempty"`
}

func RequestReshare(appCtx, waitCtx context.Context, req ReshareRequest) (*ReshareResponse, error) {
	if waitCtx == nil {
		waitCtx = context.Background()
	}
	if appCtx == nil {
		appCtx = waitCtx
	}

	req.RequestID = uuid.New().String()
	respCh := make(chan ReshareResponse, 1)

	pendingMu.Lock()
	pendingReshare[req.RequestID] = respCh
	pendingMu.Unlock()

	defer func() {
		pendingMu.Lock()
		delete(pendingReshare, req.RequestID)
		pendingMu.Unlock()
	}()

	runtime.EventsEmit(appCtx, "agent:dkls_reshare_request", req)

	timeout := time.NewTimer(defaultReshareTimeout)
	defer timeout.Stop()

	select {
	case <-waitCtx.Done():
		return nil, waitCtx.Err()
	case <-timeout.C:
		return nil, fmt.Errorf("timeout waiting for DKLS reshare response")
	case resp := <-respCh:
		if strings.TrimSpace(resp.Error) != "" {
			return nil, fmt.Errorf("DKLS reshare failed: %s", resp.Error)
		}
		if resp.EcdsaPubKey == "" || resp.EcdsaKeyshare == "" {
			return nil, fmt.Errorf("invalid DKLS reshare response: missing ECDSA data")
		}
		if resp.EddsaPubKey == "" || resp.EddsaKeyshare == "" {
			return nil, fmt.Errorf("invalid DKLS reshare response: missing EdDSA data")
		}
		return &resp, nil
	}
}

var pendingReshare = make(map[string]chan ReshareResponse)

func SubmitReshareResponse(resp ReshareResponse) error {
	if strings.TrimSpace(resp.RequestID) == "" {
		return fmt.Errorf("requestId is required")
	}

	pendingMu.Lock()
	respCh, ok := pendingReshare[resp.RequestID]
	pendingMu.Unlock()
	if !ok {
		return fmt.Errorf("no pending DKLS reshare request for requestId=%s", resp.RequestID)
	}

	select {
	case respCh <- resp:
		return nil
	default:
		return fmt.Errorf("failed to submit DKLS reshare response")
	}
}
