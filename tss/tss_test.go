package tss

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"strings"
	"testing"
)

const testHexKey = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"

// encryptForTest mirrors the CBC/PKCS#7 wire format decrypt expects, so the
// round-trip case stays honest about what a well-formed message looks like.
func encryptForTest(t *testing.T, plaintext string) string {
	t.Helper()

	key, err := hex.DecodeString(testHexKey)
	if err != nil {
		t.Fatalf("decode key: %v", err)
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		t.Fatalf("new cipher: %v", err)
	}

	padding := aes.BlockSize - len(plaintext)%aes.BlockSize
	padded := append([]byte(plaintext), strings.Repeat(string(rune(padding)), padding)...)

	out := make([]byte, aes.BlockSize+len(padded))
	iv := out[:aes.BlockSize]
	if _, err := rand.Read(iv); err != nil {
		t.Fatalf("read iv: %v", err)
	}
	cipher.NewCBCEncrypter(block, iv).CryptBlocks(out[aes.BlockSize:], padded)

	return string(out)
}

// A ciphertext whose body is not block-aligned used to reach CryptBlocks and
// panic, killing the downloadMessages goroutine and with it the whole process.
func TestDecryptRejectsNonBlockAlignedCiphertext(t *testing.T) {
	malformed := string(make([]byte, aes.BlockSize+5))

	out, err := decrypt(malformed, testHexKey)

	if err == nil {
		t.Fatalf("expected an error for non-block-aligned ciphertext, got out=%q", out)
	}
	if out != "" {
		t.Errorf("expected empty plaintext on error, got %q", out)
	}
}

// The short-ciphertext guard used to return a nil error, so callers treated a
// rejected message as an empty but valid plaintext.
func TestDecryptRejectsShortCiphertext(t *testing.T) {
	for _, size := range []int{0, 1, aes.BlockSize - 1} {
		out, err := decrypt(string(make([]byte, size)), testHexKey)

		if err == nil {
			t.Errorf("size %d: expected an error, got out=%q with nil error", size, out)
		}
		if out != "" {
			t.Errorf("size %d: expected empty plaintext on error, got %q", size, out)
		}
	}
}

func TestDecryptRoundTripsWellFormedCiphertext(t *testing.T) {
	const plaintext = "tss message body"

	out, err := decrypt(encryptForTest(t, plaintext), testHexKey)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if out != plaintext {
		t.Errorf("expected %q, got %q", plaintext, out)
	}
}

func TestDecryptRejectsInvalidKey(t *testing.T) {
	out, err := decrypt(string(make([]byte, aes.BlockSize*2)), "not-hex")

	if err == nil {
		t.Fatalf("expected an error for a non-hex key, got out=%q", out)
	}
}
