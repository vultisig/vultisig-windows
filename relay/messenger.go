package relay

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/vultisig/mobile-tss-lib/tss"
	"github.com/vultisig/vultisig-win/utils"
)

type MessengerImp struct {
	Server           string
	SessionID        string
	HexEncryptionKey string
}

var messageCache sync.Map

func (m *MessengerImp) Send(from, to, body string) error {
	if m.HexEncryptionKey != "" {
		encryptedBody, err := encrypt(body, m.HexEncryptionKey)
		if err != nil {
			return fmt.Errorf("failed to encrypt body: %w", err)
		}
		body = base64.StdEncoding.EncodeToString([]byte(encryptedBody))
	}

	hash := md5.New()
	hash.Write([]byte(body))
	hashStr := hex.EncodeToString(hash.Sum(nil))

	if hashStr == "" {
		return fmt.Errorf("hash is empty")
	}

	buf, err := json.MarshalIndent(struct {
		SessionID string   `json:"session_id,omitempty"`
		From      string   `json:"from,omitempty"`
		To        []string `json:"to,omitempty"`
		Body      string   `json:"body,omitempty"`
		Hash      string   `json:"hash,omitempty"`
	}{
		SessionID: m.SessionID,
		From:      from,
		To:        []string{to},
		Body:      body,
		Hash:      hashStr,
	}, "", "  ")
	if err != nil {
		return fmt.Errorf("fail to marshal message: %w", err)
	}

	url := fmt.Sprintf("%s/message/%s", m.Server, m.SessionID)
	req, err := http.NewRequest("POST", url, bytes.NewReader(buf))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	if body == "" {
		return fmt.Errorf("body is empty")
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			utils.Logger.Error("Failed to close response body")
		}
	}()

	if resp.Status != "202 Accepted" {
		return fmt.Errorf("fail to send message, response code is not 202 Accepted: %s", resp.Status)
	}

	utils.Logger.WithFields(logrus.Fields{
		"from": from,
		"to":   to,
		"hash": hashStr,
	}).Info("Message sent")

	return nil
}

func DownloadMessage(server, session, key, hexEncryptionKey string, tssServerImp tss.Service, endCh chan struct{}, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		select {
		case <-endCh: // we are done
			return
		case <-time.After(time.Second):
			resp, err := http.Get(server + "/message/" + session + "/" + key)
			if err != nil {
				utils.Logger.WithFields(logrus.Fields{
					"session": session,
					"key":     key,
					"error":   err,
				}).Error("Failed to get data from server")
				continue
			}
			if resp.StatusCode != http.StatusOK {
				utils.Logger.WithFields(logrus.Fields{
					"session": session,
					"key":     key,
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
				if err != io.EOF {
					utils.Logger.WithFields(logrus.Fields{
						"session": session,
						"key":     key,
						"error":   err,
					}).Error("Failed to decode data")
				}
				continue
			}
			for _, message := range messages {
				if message.From == key {
					continue
				}

				cacheKey := fmt.Sprintf("%s-%s-%s", session, key, message.Hash)
				if _, found := messageCache.Load(cacheKey); found {
					utils.Logger.WithFields(logrus.Fields{
						"session": session,
						"key":     key,
						"hash":    message.Hash,
					}).Info("Message already applied, skipping")
					continue
				}

				decryptedBody := message.Body
				if hexEncryptionKey != "" {
					decodedBody, err := base64.StdEncoding.DecodeString(message.Body)
					if err != nil {
						utils.Logger.WithFields(logrus.Fields{
							"session": session,
							"key":     key,
							"hash":    message.Hash,
							"error":   err,
						}).Error("Failed to decode data")
						continue
					}

					decryptedBody, err = decrypt(string(decodedBody), hexEncryptionKey)
					if err != nil {
						utils.Logger.WithFields(logrus.Fields{
							"session": session,
							"key":     key,
							"hash":    message.Hash,
							"error":   err,
						}).Error("Failed to decrypt data")
						continue
					}
				}

				if err := tssServerImp.ApplyData(decryptedBody); err != nil {
					utils.Logger.WithFields(logrus.Fields{
						"session": session,
						"key":     key,
						"error":   err,
					}).Error("Failed to apply data")
					continue
				}

				messageCache.Store(cacheKey, true)
				client := http.Client{}
				req, err := http.NewRequest(http.MethodDelete, server+"/message/"+session+"/"+key+"/"+message.Hash, nil)
				if err != nil {
					utils.Logger.WithFields(logrus.Fields{
						"session": session,
						"key":     key,
						"error":   err,
					}).Error("Failed to delete message")
					continue
				}

				resp, err := client.Do(req)
				if err != nil {
					utils.Logger.WithFields(logrus.Fields{
						"session": session,
						"key":     key,
						"error":   err,
					}).Error("Failed to delete message")
					continue
				}

				if resp.StatusCode != http.StatusOK {
					utils.Logger.WithFields(logrus.Fields{
						"session": session,
						"key":     key,
					}).Error("Failed to delete message, status code is not 200 OK")
					continue
				}
			}
		}
	}
}

func encrypt(plainText, hexKey string) (string, error) {
	key, err := hex.DecodeString(hexKey)
	if err != nil {
		return "", err
	}
	plainByte := []byte(plainText)
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	plainByte = pad(plainByte, aes.BlockSize)
	iv := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}
	mode := cipher.NewCBCEncrypter(block, iv)
	ciphertext := make([]byte, len(plainByte))
	mode.CryptBlocks(ciphertext, plainByte)
	ciphertext = append(iv, ciphertext...)
	return string(ciphertext), nil
}

// pad applies PKCS7 padding to the plaintext
func pad(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(data, padtext...)
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
