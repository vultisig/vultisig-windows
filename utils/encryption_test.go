package utils

import (
	"bytes"
	"encoding/base64"
	"encoding/hex"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEncrypt(t *testing.T) {
	password := []byte("mysecretpassword")
	plaintext := []byte("this is a secret message")

	ciphertext, err := Encrypt(password, plaintext)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	if len(ciphertext) <= 0 {
		t.Fatalf("Encrypt returned empty ciphertext")
	}

	// Decrypt the ciphertext to verify it matches the original plaintext
	decryptedText, err := Decrypt(password, ciphertext)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}

	if !bytes.Equal(plaintext, decryptedText) {
		t.Fatalf("Decrypted text does not match original plaintext. Got %s, want %s", decryptedText, plaintext)
	}
}

func TestEncryptWithEmptyPassword(t *testing.T) {
	password := []byte("")
	plaintext := []byte("this is a secret message")

	_, err := Encrypt(password, plaintext)
	if err == nil {
		t.Fatalf("Encrypt should fail with empty password")
	}
}

func TestEncryptWithEmptyPlaintext(t *testing.T) {
	password := []byte("mysecretpassword")
	plaintext := []byte("")

	ciphertext, err := Encrypt(password, plaintext)
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	if len(ciphertext) <= 0 {
		t.Fatalf("Encrypt returned empty ciphertext")
	}

	// Decrypt the ciphertext to verify it matches the original plaintext
	decryptedText, err := Decrypt(password, ciphertext)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}

	if !bytes.Equal(plaintext, decryptedText) {
		t.Fatalf("Decrypted text does not match original plaintext. Got %s, want %s", decryptedText, plaintext)
	}
}
func TestEncryptionRoundtrip(t *testing.T) {
	password := "password"
	src := "windows-message"
	encrypted, err := Encrypt([]byte(password), []byte(src))
	if err != nil {
		t.Fatal(err)
	}

	t.Logf("encrypted: %s", base64.StdEncoding.EncodeToString(encrypted))
	decrypted, err := Decrypt([]byte(password), encrypted)
	if err != nil {
		t.Fatal(err)
	}

	if string(decrypted) != src {
		t.Fatalf("decrypted: %s, expected: %s", decrypted, src)
	}
}

func TestDecryptFromMobileDevices(t *testing.T) {
	input := []struct {
		Name             string
		hexEncryptionKey string
		encryptedData    string
		expectedResult   string
	}{
		{
			Name:             "from-ios",
			hexEncryptionKey: "99bbc7c0941645762a688cb22efb1677865646c2c5b9706e940caf529c41ab19",
			encryptedData:    "CXzoWhNMozIdFIh7YzbXSm26QRrwtrAviVEk1baXhQKeKD76tH8=",
			expectedResult:   "helloworld",
		},
		{
			Name:             "from-android",
			hexEncryptionKey: "70617373776f7264313233",
			encryptedData:    "zPMOwnPVMFKMf9LOIFkyqBOr8AC1SIdQ34Ruk5gmRqxZ+lIyK7zM5/1NUjXlAg==",
			expectedResult:   "Original Input 123",
		},
	}
	for _, item := range input {
		t.Run(item.Name, func(st *testing.T) {
			encryptionKeyBytes, err := hex.DecodeString(item.hexEncryptionKey)
			if err != nil {
				t.Fatal(err)
			}
			decodedInput, err := base64.StdEncoding.DecodeString(item.encryptedData)
			if err != nil {
				t.Fatal(err)
			}
			decryptedData, err := DecryptGCMFallbackToCBC(encryptionKeyBytes, decodedInput)
			if err != nil {
				t.Fatal(err)
			}
			t.Logf("decrypted data: %s", decryptedData)
			assert.Equal(t, item.expectedResult, string(decryptedData))
		})
	}

}
