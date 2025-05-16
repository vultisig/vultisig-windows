package tss

import (
	"context"
	"fmt"
	"slices"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	mtss "github.com/vultisig/mobile-tss-lib/tss"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
)

func (t *TssService) Reshare(vault storage.Vault,
	sessionID, hexEncryptionKey, serverURL string) (*storage.Vault, error) {
	if vault.Name == "" {
		return nil, fmt.Errorf("vault name is empty")
	}
	if vault.LocalPartyID == "" {
		return nil, fmt.Errorf("local party id is empty")
	}
	if vault.HexChainCode == "" {
		return nil, fmt.Errorf("hex chain code is empty")
	}
	if serverURL == "" {
		return nil, fmt.Errorf("serverURL is empty")
	}
	client := relay.NewClient(serverURL)
	// wait longer for keygen start
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	partiesJoined, err := client.WaitForSessionStart(ctx, sessionID)
	t.Logger.WithFields(logrus.Fields{
		"session":        sessionID,
		"parties_joined": partiesJoined,
	}).Info("Session started")
	if err != nil {
		return nil, fmt.Errorf("failed to wait for session start: %w", err)
	}
	keyShares := make(map[string]string)
	for _, share := range vault.KeyShares {
		keyShares[share.PublicKey] = share.KeyShare
	}
	localStateAccessor, err := NewLocalStateAccessorImp(keyShares)
	if err != nil {
		return nil, fmt.Errorf("failed to create localStateAccessor: %w", err)
	}
	runtime.EventsEmit(t.ctx, "prepareVault")
	tssServerImp, err := t.createTSSService(serverURL, sessionID, hexEncryptionKey, localStateAccessor, true, "")
	if err != nil {
		return nil, fmt.Errorf("failed to create TSS service: %w", err)
	}
	localPartyID := vault.LocalPartyID
	endCh, wg := t.startMessageDownload(serverURL, sessionID, localPartyID, hexEncryptionKey, tssServerImp, "")
	ecdsaPubkey, eddsaPubkey, newResharePrefix := "", "", ""
	for attempt := 0; attempt < 3; attempt++ {
		ecdsaPubkey, eddsaPubkey, newResharePrefix, err = t.reshareWithRetry(
			tssServerImp,
			vault,
			partiesJoined,
		)
		if err == nil {
			break
		}
		t.Logger.WithFields(logrus.Fields{
			"session": sessionID,
			"attempt": attempt,
		}).Error(err)
		// reset it to the previous keyshare , so reshare can retry
		localStateAccessor.Reset(keyShares)
	}

	if err != nil {
		return nil, err
	}

	close(endCh)
	wg.Wait()

	if err := client.CompleteSession(sessionID, localPartyID); err != nil {
		t.Logger.WithFields(logrus.Fields{
			"session": sessionID,
			"error":   err,
		}).Error("Failed to complete session")
	}

	if isCompleted, err := client.CheckCompletedParties(sessionID, partiesJoined); err != nil || !isCompleted {
		t.Logger.WithFields(logrus.Fields{
			"session":     sessionID,
			"isCompleted": isCompleted,
			"error":       err,
		}).Error("Failed to check completed parties")
	}

	ecdsaKeyShare, err := localStateAccessor.GetLocalState(ecdsaPubkey)
	if err != nil {
		return nil, fmt.Errorf("failed to get local sate: %w", err)
	}

	eddsaKeyShare, err := localStateAccessor.GetLocalState(eddsaPubkey)
	if err != nil {
		return nil, fmt.Errorf("failed to get local sate: %w", err)
	}

	newVault := &storage.Vault{
		Name:           vault.Name,
		PublicKeyECDSA: ecdsaPubkey,
		PublicKeyEdDSA: eddsaPubkey,
		Signers:        partiesJoined,
		CreatedAt:      time.Now(),
		HexChainCode:   vault.HexChainCode,
		KeyShares: []storage.KeyShare{
			{
				PublicKey: ecdsaPubkey,
				KeyShare:  ecdsaKeyShare,
			},
			{
				PublicKey: eddsaPubkey,
				KeyShare:  eddsaKeyShare,
			},
		},
		LocalPartyID:  vault.LocalPartyID,
		ResharePrefix: newResharePrefix,
		Order:         0,
		IsBackedUp:    false,
		Coins:         vault.Coins,
		LibType:       "GG20",
	}

	return newVault, nil
}

func (t *TssService) getOldParties(newParties []string, oldSignerCommittee []string) []string {
	oldParties := make([]string, 0)
	for _, party := range oldSignerCommittee {
		if slices.Contains(newParties, party) {
			oldParties = append(oldParties, party)
		}
	}
	return oldParties
}

func (t *TssService) reshareWithRetry(tssService *mtss.ServiceImpl,
	vault storage.Vault,
	newParties []string,
) (string, string, string, error) {
	oldParties := t.getOldParties(newParties, vault.Signers)
	resp, err := t.reshareECDSAKey(tssService, vault.PublicKeyECDSA, vault.LocalPartyID, vault.HexChainCode, vault.ResharePrefix,
		newParties, oldParties)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to reshare ECDSA key: %w", err)
	}
	newResharePrefix := resp.ResharePrefix
	ecdsaPubkey := resp.PubKey
	resp, err = t.reshareEDDSAKey(tssService, vault.PublicKeyEdDSA, vault.LocalPartyID, vault.HexChainCode, vault.ResharePrefix,
		newParties, oldParties, newResharePrefix)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to reshare EDDSA key: %w", err)
	}
	eddsaPubkey := resp.PubKey
	return ecdsaPubkey, eddsaPubkey, newResharePrefix, nil
}

func (t *TssService) reshareECDSAKey(tssService *mtss.ServiceImpl,
	publicKey string,
	localPartyID, hexChainCode string,
	resharePrefix string,
	partiesJoined []string,
	oldParties []string) (*mtss.ReshareResponse, error) {
	runtime.EventsEmit(t.ctx, "ecdsa")
	t.Logger.WithFields(logrus.Fields{
		"public_key":         publicKey,
		"localPartyID":       localPartyID,
		"chain_code":         hexChainCode,
		"reshare_prefix":     resharePrefix,
		"parties_joined":     partiesJoined,
		"old_parties":        oldParties,
		"new_reshare_prefix": "",
	}).Info("Start ECDSA reshare...")

	resp, err := tssService.ReshareECDSA(&mtss.ReshareRequest{
		PubKey:           publicKey,
		LocalPartyID:     localPartyID,
		NewParties:       strings.Join(partiesJoined, ","),
		OldParties:       strings.Join(oldParties, ","),
		ChainCodeHex:     hexChainCode,
		ResharePrefix:    resharePrefix,
		NewResharePrefix: "",
	})
	if err != nil {
		return nil, fmt.Errorf("fail to reshare ECDSA key: %w", err)
	}
	t.Logger.WithFields(logrus.Fields{
		"key":     localPartyID,
		"pub_key": resp.PubKey,
	}).Info("ECDSA keygen response")

	return resp, nil
}

func (t *TssService) reshareEDDSAKey(tssService *mtss.ServiceImpl,
	publicKey string,
	localPartyID, hexChainCode string,
	resharePrefix string,
	partiesJoined []string,
	oldParties []string,
	newResharePrefix string) (*mtss.ReshareResponse, error) {
	runtime.EventsEmit(t.ctx, "eddsa")
	t.Logger.WithFields(logrus.Fields{
		"public_key":         publicKey,
		"localPartyID":       localPartyID,
		"chain_code":         hexChainCode,
		"reshare_prefix":     resharePrefix,
		"parties_joined":     partiesJoined,
		"old_parties":        oldParties,
		"new_reshare_prefix": newResharePrefix,
	}).Info("Start EdDSA reshare...")
	resp, err := tssService.ResharingEdDSA(&mtss.ReshareRequest{
		PubKey:           publicKey,
		LocalPartyID:     localPartyID,
		NewParties:       strings.Join(partiesJoined, ","),
		ChainCodeHex:     hexChainCode,
		OldParties:       strings.Join(oldParties, ","),
		ResharePrefix:    resharePrefix,
		NewResharePrefix: newResharePrefix,
	})
	if err != nil {
		return nil, fmt.Errorf("fail to reshare EdDSA key: %w", err)
	}
	t.Logger.WithFields(logrus.Fields{
		"localPartyID": localPartyID,
		"pub_key":      resp.PubKey,
	}).Info("EdDSA reshare response")
	return resp, nil
}
