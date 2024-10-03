package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"errors"
	"fmt"
	"io"
)

func Encrypt(password []byte, input []byte) ([]byte, error) {
	if len(password) == 0 {
		return nil, errors.New("password cannot be empty")
	}
	// Hash the password to create a key
	hash := sha256.Sum256(password)
	key := hash[:]

	// Create a new AES cipher using the key
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Use GCM (Galois/Counter Mode)
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// Create a nonce. Nonce size is specified by GCM
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	// Seal encrypts and authenticates plaintext
	ciphertext := gcm.Seal(nonce, nonce, input, nil)
	return ciphertext, nil
}

func Decrypt(password []byte, input []byte) ([]byte, error) {
	// Hash the password to create a key
	hash := sha256.Sum256(password)
	key := hash[:]

	// Create a new AES cipher using the key
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Use GCM (Galois/Counter Mode)
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// Get the nonce size
	nonceSize := gcm.NonceSize()
	if len(input) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	// Extract the nonce from the vault
	nonce, ciphertext := input[:nonceSize], input[nonceSize:]

	// Decrypt the vault
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}
func DecryptGCMFallbackToCBC(password []byte, input []byte) ([]byte, error) {
	result, err := Decrypt(password, input)
	if err == nil && result != nil {
		return result, nil
	}
	// fallback to CBC
	return decryptCBC(password, input)
}

func decryptCBC(key []byte, cipherText []byte) ([]byte, error) {
	var block cipher.Block
	var err error
	cipherByte := cipherText
	if block, err = aes.NewCipher(key); err != nil {
		return nil, err
	}
	if len(cipherByte) < aes.BlockSize {
		fmt.Printf("ciphertext too short")
		return nil, err
	}

	iv := cipherByte[:aes.BlockSize]
	cipherByte = cipherByte[aes.BlockSize:]

	cbc := cipher.NewCBCDecrypter(block, iv)
	plaintext := make([]byte, len(cipherByte))
	cbc.CryptBlocks(plaintext, cipherByte)
	return unpad(plaintext)
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
