package tss

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	mtss "github.com/vultisig/mobile-tss-lib/tss"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
)

const VULTISIG_ROUTER_URL = "https://api.vultisig.com/router"

// TssService is the service for TSS
type TssService struct {
	ctx        context.Context
	serviceIns *mtss.ServiceImpl
	Logger     *logrus.Logger
}

func NewTssService() *TssService {
	return &TssService{
		Logger: logrus.WithField("module", "tss").Logger,
	}
}
func (t *TssService) Startup(ctx context.Context) {
	t.ctx = ctx
}

// GetDerivedPubKey returns the derived public key
func (t *TssService) GetDerivedPubKey(hexPubKey, hexChainCode, path string, isEdDSA bool) (string, error) {
	return mtss.GetDerivedPubKey(hexPubKey, hexChainCode, path, isEdDSA)
}
func (t *TssService) GetLocalUIEcdsa(keyshare string) (string, error) {
	return mtss.GetLocalUIEcdsa(keyshare)
}
func (t *TssService) GetLocalUIEdDSA(keyshare string) (string, error) {
	return mtss.GetLocalUIEddsa(keyshare)
}
func (t *TssService) StartKeygen(name, localPartyID, sessionID, hexChainCode, hexEncryptionKey string, serverURL string) (*storage.Vault, error) {
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

	localStateAccessor, err := NewLocalStateAccessorImp(map[string]string{})
	if err != nil {
		return nil, fmt.Errorf("failed to create localStateAccessor: %w", err)
	}
	runtime.EventsEmit(t.ctx, "prepareVault")
	tssServerImp, err := t.createTSSService(serverURL, sessionID, hexEncryptionKey, localStateAccessor, true)
	if err != nil {
		return nil, fmt.Errorf("failed to create TSS service: %w", err)
	}
	endCh, wg := t.startMessageDownload(serverURL, sessionID, localPartyID, hexEncryptionKey, tssServerImp, "")
	ecdsaPubkey, eddsaPubkey := "", ""
	for attempt := 0; attempt < 3; attempt++ {
		ecdsaPubkey, eddsaPubkey, err = t.keygenWithRetry(
			localPartyID,
			hexChainCode,
			partiesJoined,
			tssServerImp)
		if err == nil {
			break
		}
		t.Logger.WithFields(logrus.Fields{
			"session": sessionID,
			"attempt": attempt,
		}).Error(err)
	}
	close(endCh)
	wg.Wait()
	if err != nil {
		return nil, err
	}

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

	vault := &storage.Vault{
		Name:           name,
		PublicKeyECDSA: ecdsaPubkey,
		PublicKeyEdDSA: eddsaPubkey,
		Signers:        partiesJoined,
		CreatedAt:      time.Now(),
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
		LocalPartyID:  localPartyID,
		ResharePrefix: "",
		Order:         0,
		IsBackedUp:    false,
		Coins:         []storage.Coin{},
		LibType:       "GG20",
	}

	return vault, nil
}

func (t *TssService) createTSSService(serverURL, Session, HexEncryptionKey string, localStateAccessor mtss.LocalStateAccessor, createPreParam bool) (*mtss.ServiceImpl, error) {
	messenger, err := relay.NewMessengerImp(serverURL, Session, HexEncryptionKey)
	if err != nil {
		return nil, fmt.Errorf("create messenger: %w", err)
	}
	tssService, err := mtss.NewService(messenger, localStateAccessor, createPreParam)
	if err != nil {
		return nil, fmt.Errorf("create TSS service: %w", err)
	}
	return tssService, nil
}

func (t *TssService) startMessageDownload(serverURL, session, localPartyID, hexEncryptionKey string,
	tssService mtss.Service,
	messageID string) (chan struct{}, *sync.WaitGroup) {
	t.Logger.WithFields(logrus.Fields{
		"session":          session,
		"localPartyID":     localPartyID,
		"hexEncryptionKey": hexEncryptionKey,
	}).Info("Start downloading messages")

	endCh := make(chan struct{})
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go t.downloadMessages(serverURL, session, localPartyID, hexEncryptionKey, tssService, endCh, messageID, wg)
	return endCh, wg
}

func (t *TssService) downloadMessages(server,
	session,
	localPartyID,
	hexEncryptionKey string,
	tssServerImp mtss.Service,
	endCh chan struct{},
	messageID string,
	wg *sync.WaitGroup) {
	var messageCache sync.Map
	defer wg.Done()
	for {
		select {
		case <-endCh: // we are done
			return
		case <-time.After(time.Second):
			req, err := http.NewRequest(http.MethodGet, server+"/message/"+session+"/"+localPartyID, nil)
			if err != nil {
				t.Logger.WithFields(logrus.Fields{
					"session":      session,
					"localPartyID": localPartyID,
					"error":        err,
				}).Error("Fail to create request")
				return
			}
			if messageID != "" {
				req.Header.Set("message_id", messageID)
			}
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				t.Logger.WithFields(logrus.Fields{
					"session":      session,
					"localPartyID": localPartyID,
					"error":        err,
				}).Error("Failed to get data from server")
				continue
			}
			if resp.StatusCode != http.StatusOK {
				t.Logger.WithFields(logrus.Fields{
					"session":      session,
					"localPartyID": localPartyID,
				}).Error("Failed to get data from server, status code is not 200 OK")
				continue
			}
			decoder := json.NewDecoder(resp.Body)
			var messages []struct {
				SessionID  string   `json:"session_id,omitempty"`
				From       string   `json:"from,omitempty"`
				To         []string `json:"to,omitempty"`
				Body       string   `json:"body,omitempty"`
				Hash       string   `json:"hash,omitempty"`
				SequenceNo int64    `json:"sequence_no,omitempty"`
			}
			if err := decoder.Decode(&messages); err != nil {
				t.Logger.WithFields(logrus.Fields{
					"session":      session,
					"localPartyID": localPartyID,
					"error":        err,
				}).Error("Failed to decode data")
				continue
			}
			sort.Slice(messages, func(i, j int) bool {
				return messages[i].SequenceNo < messages[j].SequenceNo
			})
			for _, message := range messages {
				cacheKey := fmt.Sprintf("%s-%s-%s", session, localPartyID, message.Hash)
				if messageID != "" {
					cacheKey = fmt.Sprintf("%s-%s-%s-%s", session, localPartyID, messageID, message.Hash)
				}
				if _, found := messageCache.Load(cacheKey); found {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"hash":         message.Hash,
					}).Info("Message already applied, skipping")
					continue
				}
				decodedBody, err := base64.StdEncoding.DecodeString(message.Body)
				if err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"hash":         message.Hash,
						"error":        err,
					}).Error("Failed to base64 decode data")
					continue
				}

				decryptedBody, err := decrypt(string(decodedBody), hexEncryptionKey)
				if err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"hash":         message.Hash,
						"error":        err,
					}).Error("Failed to decrypt data")
					continue
				}
				t.Logger.Infof("Got message from: %s to: %s key: %s", message.From, message.To, message.Hash)
				if err := tssServerImp.ApplyData(decryptedBody); err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"error":        err,
					}).Error("Failed to apply data")
					continue
				}

				messageCache.Store(cacheKey, true)

				reqDel, err := http.NewRequest(http.MethodDelete, server+"/message/"+session+"/"+localPartyID+"/"+message.Hash, nil)
				if err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"error":        err,
					}).Error("Failed to delete message")
					continue
				}
				if messageID != "" {
					reqDel.Header.Set("message_id", messageID)
				}
				resp, err := http.DefaultClient.Do(reqDel)
				if err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"error":        err,
					}).Error("Failed to delete message")
					continue
				}

				if resp.StatusCode != http.StatusOK {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
					}).Error("Failed to delete message, status code is not 200 OK")
					continue
				}
			}
		}
	}
}
func (t *TssService) keygenWithRetry(localPartyID, hexChainCode string, partiesJoined []string, tssService mtss.Service) (string, string, error) {
	resp, err := t.generateECDSAKey(tssService, localPartyID, hexChainCode, partiesJoined)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate ECDSA key: %w", err)
	}
	time.Sleep(time.Second)
	respEDDSA, err := t.generateEDDSAKey(tssService, localPartyID, hexChainCode, partiesJoined)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate EDDSA key: %w", err)
	}
	return resp.PubKey, respEDDSA.PubKey, nil
}

func (t *TssService) generateECDSAKey(tssService mtss.Service, key, hexChainCode string, partiesJoined []string) (*mtss.KeygenResponse, error) {
	runtime.EventsEmit(t.ctx, "ecdsa")
	t.Logger.WithFields(logrus.Fields{
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
	t.Logger.WithFields(logrus.Fields{
		"key":     key,
		"pub_key": resp.PubKey,
	}).Info("ECDSA keygen response")

	return resp, nil
}

func (t *TssService) generateEDDSAKey(tssService mtss.Service, key, hexChainCode string, partiesJoined []string) (*mtss.KeygenResponse, error) {
	runtime.EventsEmit(t.ctx, "eddsa")
	t.Logger.WithFields(logrus.Fields{
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
	t.Logger.WithFields(logrus.Fields{
		"key":     key,
		"pub_key": resp.PubKey,
	}).Info("EDDSA keygen response")
	return resp, nil
}

func decrypt(cipherText, hexKey string) (string, error) {
	var block cipher.Block
	var err error
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", err
	}
	cipherByte := []byte(cipherText)

	if block, err = aes.NewCipher(key); err != nil {
		return "", err
	}

	if len(cipherByte) < aes.BlockSize {
		fmt.Printf("ciphertext too short")
		return "", err
	}

	iv := cipherByte[:aes.BlockSize]
	cipherByte = cipherByte[aes.BlockSize:]

	cbc := cipher.NewCBCDecrypter(block, iv)
	plaintext := make([]byte, len(cipherByte))
	cbc.CryptBlocks(plaintext, cipherByte)
	plaintext, err = unpad(plaintext)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

func unpad(data []byte) ([]byte, error) {
	length := len(data)
	if length == 0 {
		return nil, errors.New("unpad: input data is empty")
	}

	paddingLen := int(data[length-1])
	if paddingLen > length || paddingLen == 0 {
		return nil, errors.New("unpad: invalid padding length")
	}

	for i := 0; i < paddingLen; i++ {
		if data[length-1-i] != byte(paddingLen) {
			return nil, errors.New("unpad: invalid padding")
		}
	}

	return data[:length-paddingLen], nil
}
