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
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	mtss "github.com/vultisig/mobile-tss-lib/tss"

	"github.com/vultisig/vultisig-win/relay"
	"github.com/vultisig/vultisig-win/storage"
)

const VULTISIG_ROUTER_URL = "https://api.vultisig.com/router"

// TssService is the service for TSS
type TssService struct {
	serviceIns *mtss.ServiceImpl
	Logger     *logrus.Logger
}

func NewTssService() *TssService {
	return &TssService{
		Logger: logrus.WithField("module", "tss").Logger,
	}
}

// GetDerivedPubKey returns the derived public key
func (t *TssService) GetDerivedPubKey(hexPubKey, hexChainCode, path string, isEdDSA bool) (string, error) {
	return mtss.GetDerivedPubKey(hexPubKey, hexChainCode, path, isEdDSA)
}

func (t *TssService) StartKeygen(name, localPartID, sessionID, hexChainCode, hexEncryptionKey string, localMediator string) (*storage.Vault, error) {
	serverURL := VULTISIG_ROUTER_URL
	if len(localMediator) > 0 {
		serverURL = localMediator
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

	localStateAccessor, err := NewLocalStateAccessorImp(localPartID, "vaults")
	if err != nil {
		return nil, fmt.Errorf("failed to create localStateAccessor: %w", err)
	}

	tssServerImp, err := t.createTSSService(serverURL, sessionID, hexEncryptionKey, localStateAccessor, true)
	if err != nil {
		return nil, fmt.Errorf("failed to create TSS service: %w", err)
	}

	ecdsaPubkey, eddsaPubkey := "", ""
	for attempt := 0; attempt < 3; attempt++ {
		ecdsaPubkey, eddsaPubkey, err = t.keygenWithRetry(serverURL,
			sessionID,
			localPartID,
			hexEncryptionKey,
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

	if err != nil {
		return nil, err
	}

	if err := client.CompleteSession(sessionID, localPartID); err != nil {
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
		LocalPartyID:  localPartID,
		ResharePrefix: "",
		Order:         0,
		IsBackedUp:    false,
		Coins:         []storage.Coin{},
	}

	err = localStateAccessor.RemoveLocalState(ecdsaPubkey)
	if err != nil {
		return nil, fmt.Errorf("failed to remove local state: %w", err)
	}

	return vault, nil
}

func (t *TssService) createTSSService(serverURL, Session, HexEncryptionKey string, localStateAccessor mtss.LocalStateAccessor, createPreParam bool) (mtss.Service, error) {
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

func (t *TssService) startMessageDownload(serverURL, session, key, hexEncryptionKey string, tssService mtss.Service) (chan struct{}, *sync.WaitGroup) {
	t.Logger.WithFields(logrus.Fields{
		"session": session,
		"key":     key,
	}).Info("Start downloading messages")

	endCh := make(chan struct{})
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go t.downloadMessages(serverURL, session, key, hexEncryptionKey, tssService, endCh, wg)
	return endCh, wg
}

func (t *TssService) downloadMessages(server,
	session,
	localPartyID,
	hexEncryptionKey string,
	tssServerImp mtss.Service,
	endCh chan struct{},
	wg *sync.WaitGroup) {
	var messageCache sync.Map
	defer wg.Done()
	for {
		select {
		case <-endCh: // we are done
			return
		case <-time.After(time.Second):
			resp, err := http.Get(server + "/message/" + session + "/" + localPartyID)
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
				SessionID string   `json:"session_id,omitempty"`
				From      string   `json:"from,omitempty"`
				To        []string `json:"to,omitempty"`
				Body      string   `json:"body,omitempty"`
				Hash      string   `json:"hash,omitempty"`
			}
			if err := decoder.Decode(&messages); err != nil {
				t.Logger.WithFields(logrus.Fields{
					"session":      session,
					"localPartyID": localPartyID,
					"error":        err,
				}).Error("Failed to decode data")
				continue
			}
			for _, message := range messages {
				if message.From == localPartyID {
					continue
				}
				cacheKey := fmt.Sprintf("%s-%s-%s", session, localPartyID, message.Hash)
				if _, found := messageCache.Load(cacheKey); found {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"hash":         message.Hash,
					}).Info("Message already applied, skipping")
					continue
				}

				decryptedBody := message.Body
				if hexEncryptionKey != "" {
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

					decryptedBody, err = decrypt(string(decodedBody), hexEncryptionKey)
					if err != nil {
						t.Logger.WithFields(logrus.Fields{
							"session":      session,
							"localPartyID": localPartyID,
							"hash":         message.Hash,
							"error":        err,
						}).Error("Failed to decrypt data")
						continue
					}
				}

				if err := tssServerImp.ApplyData(decryptedBody); err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"error":        err,
					}).Error("Failed to apply data")
					continue
				}

				messageCache.Store(cacheKey, true)
				client := http.Client{}
				req, err := http.NewRequest(http.MethodDelete, server+"/message/"+session+"/"+localPartyID+"/"+message.Hash, nil)
				if err != nil {
					t.Logger.WithFields(logrus.Fields{
						"session":      session,
						"localPartyID": localPartyID,
						"error":        err,
					}).Error("Failed to delete message")
					continue
				}

				resp, err := client.Do(req)
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
func (t *TssService) keygenWithRetry(serverURL, sessionID, key, hexEncryptionKey, hexChainCode string, partiesJoined []string, tssService mtss.Service) (string, string, error) {
	endCh, wg := t.startMessageDownload(serverURL, sessionID, key, hexEncryptionKey, tssService)
	resp, err := t.generateECDSAKey(tssService, key, hexChainCode, partiesJoined)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate ECDSA key: %w", err)
	}
	time.Sleep(time.Second)
	respEDDSA, err := t.generateEDDSAKey(tssService, key, hexChainCode, partiesJoined)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate EDDSA key: %w", err)
	}

	close(endCh)
	wg.Wait()

	return resp.PubKey, respEDDSA.PubKey, nil
}

func (t *TssService) generateECDSAKey(tssService mtss.Service, key, hexChainCode string, partiesJoined []string) (*mtss.KeygenResponse, error) {
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

// KeysignECDSA
func (t *TssService) KeysignECDSA(req *mtss.KeysignRequest) (*mtss.KeysignResponse, error) {
	return t.serviceIns.KeysignECDSA(req)
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
