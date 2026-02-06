package signing

import (
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/sha3"
)

func EthereumSignHash(message string) string {
	prefixed := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	hasher := sha3.NewLegacyKeccak256()
	hasher.Write([]byte(prefixed))
	return hex.EncodeToString(hasher.Sum(nil))
}

func FormatSignature(rHex, sHex, recoveryID string) string {
	return "0x" + rHex + sHex + recoveryID
}

func FormatDerSignature(rHex, sHex, recoveryID string) string {
	return rHex + sHex + recoveryID
}
