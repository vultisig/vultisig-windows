package verifier

import (
	"encoding/json"
	"testing"
	"time"
)

func TestGenerateAuthMessageMatchesMarketplaceContract(t *testing.T) {
	const compressedPubKey = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"

	raw, err := GenerateAuthMessage(compressedPubKey)
	if err != nil {
		t.Fatalf("generate auth message failed: %v", err)
	}

	var payload map[string]string
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		t.Fatalf("invalid auth payload json: %v", err)
	}

	if payload["message"] != "Sign into Vultisig App Store" {
		t.Fatalf("unexpected message: %s", payload["message"])
	}
	if payload["nonce"] == "" {
		t.Fatal("nonce must not be empty")
	}
	if payload["address"] != "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf" {
		t.Fatalf("unexpected address: %s", payload["address"])
	}

	expiresAt, err := time.Parse(time.RFC3339, payload["expiresAt"])
	if err != nil {
		t.Fatalf("invalid expiresAt: %v", err)
	}
	untilExpiry := time.Until(expiresAt)
	if untilExpiry < 14*time.Minute || untilExpiry > 16*time.Minute {
		t.Fatalf("unexpected expiry window: %s", untilExpiry)
	}
}
