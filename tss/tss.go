package tss

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	mtss "github.com/vultisig/mobile-tss-lib/tss"
	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
	"github.com/vultisig/vultisig-win/utils"
)

type TssService struct {
	ctx        context.Context
	serviceIns *mtss.ServiceImpl
}

func NewTssService() *TssService {
	return &TssService{}
}


func (t *TssService) KeysignECDSA(req *mtss.KeysignRequest) (*mtss.KeysignResponse, error) {
	return t.serviceIns.KeysignECDSA(req)
}

// GetDerivedPubKey returns the derived public key
func (t *TssService) GetDerivedPubKey(hexPubKey, hexChainCode, path string, isEdDSA bool) (string, error) {
	return mtss.GetDerivedPubKey(hexPubKey, hexChainCode, path, isEdDSA)
}

func (t *TssService) StartKeygen(name, key, sessionID, hexChainCode, hexEncryptionKey string) (*storage.Vault, error) {
	serverURL := "https://api.vultisig.com/router"
	server := relay.NewServer(serverURL)

	// Let's register session here
	if err := server.RegisterSession(sessionID, key); err != nil {
		return nil, fmt.Errorf("failed to register session: %w", err)
	}
	// wait longer for keygen start
	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Minute)
	defer cancel()

	partiesJoined, err := server.WaitForSessionStart(ctx, sessionID)
	utils.Logger.WithFields(logrus.Fields{
		"session":        sessionID,
		"parties_joined": partiesJoined,
	}).Info("Session started")

	if err != nil {
		return nil, fmt.Errorf("failed to wait for session start: %w", err)
	}

	localStateAccessor, err := relay.NewLocalStateAccessorImp(key, "vaults")
	if err != nil {
		return nil, fmt.Errorf("failed to create localStateAccessor: %w", err)
	}

	tssServerImp, err := createTSSService(serverURL, sessionID, hexEncryptionKey, localStateAccessor, true)
	if err != nil {
		return nil, fmt.Errorf("failed to create TSS service: %w", err)
	}

	ecdsaPubkey, eddsaPubkey := "", ""
	for attempt := 0; attempt < 3; attempt++ {
		ecdsaPubkey, eddsaPubkey, err = keygenWithRetry(serverURL, sessionID, key, hexEncryptionKey, hexChainCode, partiesJoined, tssServerImp)
		if err == nil {
			break
		}
	}

	if err != nil {
		return nil, err
	}

	if err := server.CompleteSession(sessionID, key); err != nil {
		utils.Logger.WithFields(logrus.Fields{
			"session": sessionID,
			"error":   err,
		}).Error("Failed to complete session")
	}

	if isCompleted, err := server.CheckCompletedParties(sessionID, partiesJoined); err != nil || !isCompleted {
		utils.Logger.WithFields(logrus.Fields{
			"session":     sessionID,
			"isCompleted": isCompleted,
			"error":       err,
		}).Error("Failed to check completed parties")
	}

	if err := server.EndSession(sessionID); err != nil {
		utils.Logger.WithFields(logrus.Fields{
			"session": sessionID,
			"error":   err,
		}).Error("Failed to end session")
	}

	ecdsaKeyShare, err := localStateAccessor.GetLocalState(ecdsaPubkey)
	if err != nil {
		return nil, fmt.Errorf("failed to get local sate: %w", err)
	}

	eddsaKeyShare, err := localStateAccessor.GetLocalState(eddsaPubkey)
	if err != nil {
		return nil, fmt.Errorf("failed to get local sate: %w", err)
	}

	vault := &storage.Vault{
		Name:           name,
		PublicKeyECDSA: ecdsaPubkey,
		PublicKeyEdDSA: eddsaPubkey,
		Signers:        partiesJoined,
		CreatedAt:      time.Time{},
		HexChainCode:   hexChainCode,
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
		LocalPartyID:   key,
		ResharePrefix:  "",
		Order:          0,
		IsBackedUp:     false,
		Coins:          []storage.Coin{},
	}

	err = localStateAccessor.RemoveLocalState(ecdsaPubkey)
	if err != nil {
		return nil, fmt.Errorf("failed to remove local state: %w", err)
	}

	return vault, nil
}

func createTSSService(serverURL, Session, HexEncryptionKey string, localStateAccessor mtss.LocalStateAccessor, createPreParam bool) (mtss.Service, error) {
	messenger := &relay.MessengerImp{
		Server:           serverURL,
		SessionID:        Session,
		HexEncryptionKey: HexEncryptionKey,
	}

	tssService, err := mtss.NewService(messenger, localStateAccessor, createPreParam)
	if err != nil {
		return nil, fmt.Errorf("create TSS service: %w", err)
	}
	return tssService, nil
}

func startMessageDownload(serverURL, session, key, hexEncryptionKey string, tssService mtss.Service) (chan struct{}, *sync.WaitGroup) {
	utils.Logger.WithFields(logrus.Fields{
		"session": session,
		"key":     key,
	}).Info("Start downloading messages")

	endCh := make(chan struct{})
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go relay.DownloadMessage(serverURL, session, key, hexEncryptionKey, tssService, endCh, wg)
	return endCh, wg
}

func keygenWithRetry(serverURL, sessionID, key, hexEncryptionKey, hexChainCode string, partiesJoined []string, tssService mtss.Service) (string, string, error) {
	endCh, wg := startMessageDownload(serverURL, sessionID, key, hexEncryptionKey, tssService)

	resp, err := generateECDSAKey(tssService, key, hexChainCode, partiesJoined)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate ECDSA key: %w", err)
	}

	respEDDSA, err := generateEDDSAKey(tssService, key, hexChainCode, partiesJoined)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate EDDSA key: %w", err)
	}

	close(endCh)
	wg.Wait()

	return resp.PubKey, respEDDSA.PubKey, nil
}

func generateECDSAKey(tssService mtss.Service, key, hexChainCode string , partiesJoined []string) (*mtss.KeygenResponse, error) {
	utils.Logger.WithFields(logrus.Fields{
		"key":            key,
		"chain_code":     hexChainCode,
		"parties_joined": partiesJoined,
	}).Info("Start ECDSA keygen...")
	resp, err := tssService.KeygenECDSA(&mtss.KeygenRequest{
		LocalPartyID: key,
		AllParties:   strings.Join(partiesJoined, ","),
		ChainCodeHex: hexChainCode,
	})
	if err != nil {
		return nil, fmt.Errorf("generate ECDSA key: %w", err)
	}
	utils.Logger.WithFields(logrus.Fields{
		"key":     key,
		"pub_key": resp.PubKey,
	}).Info("ECDSA keygen response")
	time.Sleep(time.Second)
	return resp, nil
}

func generateEDDSAKey(tssService mtss.Service, key, hexChainCode string, partiesJoined []string) (*mtss.KeygenResponse, error) {
	utils.Logger.WithFields(logrus.Fields{
		"key":            key,
		"chain_code":     hexChainCode,
		"parties_joined": partiesJoined,
	}).Info("Start EDDSA keygen...")
	resp, err := tssService.KeygenEdDSA(&mtss.KeygenRequest{
		LocalPartyID: key,
		AllParties:   strings.Join(partiesJoined, ","),
		ChainCodeHex: hexChainCode,
	})
	if err != nil {
		return nil, fmt.Errorf("generate EDDSA key: %w", err)
	}
	utils.Logger.WithFields(logrus.Fields{
		"key":     key,
		"pub_key": resp.PubKey,
	}).Info("EDDSA keygen response")
	time.Sleep(time.Second)
	return resp, nil
}