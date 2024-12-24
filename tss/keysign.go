package tss

import (
	"context"
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
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

// Keysign signs a message using TSS
func (t *TssService) Keysign(
	vault storage.Vault,
	messages []string,
	localPartyID string,
	derivePath string,
	sessionID,
	hexEncryptionKey,
	serverURL,
	tssType string,
) ([]*mtss.KeysignResponse, error) {
	//sort the messages before signing
	slices.Sort(messages)
	t.Logger.WithFields(logrus.Fields{
		"sessionID":        sessionID,
		"hexEncryptionKey": hexEncryptionKey,
		"messages":         messages,
		"localPartyID":     localPartyID,
	}).Info("KeysignECDSA")

	client := relay.NewClient(serverURL)
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	partiesJoined, err := client.WaitForSessionStart(ctx, sessionID)
	t.Logger.WithFields(logrus.Fields{
		"session":        sessionID,
		"parties_joined": partiesJoined,
	}).Info("Session started")
	if err != nil {
		return nil, fmt.Errorf("failed to wait for session start: %w", err)
	}
	if !slices.Contains(partiesJoined, localPartyID) {
		return nil, fmt.Errorf("local party not in parties joined")
	}
	for _, item := range partiesJoined {
		if !slices.Contains(vault.Signers, item) {
			return nil, fmt.Errorf("device %s in not in current vault's signers list", item)
		}
	}
	runtime.EventsEmit(t.ctx, "PrepareVault")
	vaultShares := make(map[string]string)
	for _, item := range vault.KeyShares {
		vaultShares[item.PublicKey] = item.KeyShare
	}

	localStateAccessor, err := NewLocalStateAccessorImp(vaultShares)
	if err != nil {
		return nil, fmt.Errorf("failed to create localStateAccessor: %w", err)
	}
	tssServerImp, err := t.createTSSService(serverURL, sessionID, hexEncryptionKey, localStateAccessor, false)
	if err != nil {
		return nil, fmt.Errorf("failed to create TSS service: %w", err)
	}
	var result []*mtss.KeysignResponse
	for _, msg := range messages {
		resp, err := t.keysignWithRetry(vault,
			tssServerImp,
			partiesJoined,
			msg,
			localPartyID,
			tssType,
			derivePath,
			sessionID,
			hexEncryptionKey,
			serverURL)
		if err != nil {
			return nil, fmt.Errorf("failed to keysign: %w", err)
		}
		result = append(result, resp)
	}

	return result, nil
}
func (t *TssService) isEdDSA(tssType string) bool {
	return strings.EqualFold(tssType, "eddsa")
}
func (t *TssService) keysignWithRetry(
	vault storage.Vault,
	tssServerImp *mtss.ServiceImpl,
	keysignCommittee []string,
	message string,
	localPartyID string,
	tssType string,
	derivePath string,
	sessionID, hexEncryptionKey, serverURL string) (*mtss.KeysignResponse, error) {
	t.Logger.Infof("signing message: %s", message)
	messageID := hex.EncodeToString(md5.New().Sum([]byte(message)))
	msgBuf, err := hex.DecodeString(message)
	if err != nil {
		return nil, fmt.Errorf("failed to decode message: %w", err)
	}
	messageToSign := base64.StdEncoding.EncodeToString(msgBuf)
	endCh, wg := t.startMessageDownload(serverURL, sessionID, localPartyID, hexEncryptionKey, tssServerImp, messageID)
	publicKey := vault.PublicKeyECDSA
	if t.isEdDSA(tssType) {
		runtime.EventsEmit(t.ctx, "EDDSA")
		publicKey = vault.PublicKeyEdDSA
	} else {
		runtime.EventsEmit(t.ctx, "ECDSA")
	}
	var resp *mtss.KeysignResponse
	client := relay.NewClient(serverURL)
	for attempt := 0; attempt < 3; attempt++ {
		req := &mtss.KeysignRequest{
			PubKey:               publicKey,
			KeysignCommitteeKeys: strings.Join(keysignCommittee, ","),
			MessageToSign:        messageToSign,
			LocalPartyKey:        localPartyID,
			DerivePath:           derivePath,
		}
		if t.isEdDSA(tssType) {
			resp, err = tssServerImp.KeysignEdDSA(req)
		} else {
			resp, err = tssServerImp.KeysignECDSA(req)
		}
		if err == nil {
			if err := client.MarkKeysignComplete(sessionID, messageID, *resp); err != nil {
				t.Logger.WithFields(logrus.Fields{
					"error": err,
				}).Error("Failed to mark keysign complete")
			}
			break
		}
		t.Logger.WithFields(logrus.Fields{
			"attempt": attempt,
			"error":   err,
		}).Error("Failed to keysign")
		// double check whether other party already get signature
		sigResp, checkErr := client.CheckKeysignComplete(sessionID, messageID)
		if checkErr == nil && sigResp != nil {
			t.Logger.Info("Other party already get signature")
			resp = sigResp
			break
		}
	}
	close(endCh)
	wg.Wait()
	if resp != nil {
		return resp, nil
	}

	return nil, fmt.Errorf("failed to keysign: %w", err)

}
