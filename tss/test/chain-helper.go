// tss/tests/chain_helper_test.go
package tests

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	pb "github.com/vultisig/commondata/go/vultisig/keysign/v1"
	"github.com/vultisig/vultisig-win/tss/helpers"
	"google.golang.org/protobuf/encoding/protojson"
)

const (
	vaultHexPub  = "023e4b76861289ad4528b33c2fd21b3a5160cd37b3294234914e21efb6ed4a452b"
	vaultHexCode = "c9b189a8232b872b8d9ccd867d0db316dd10f56e729c310fe072adf5fd204ae7"
)

// ChainHelperTestCase matches the JSON schema.
type ChainHelperTestCase struct {
	Name              string          `json:"name"`
	KeysignPayloadRaw json.RawMessage `json:"keysign_payload"`
	ExpectedImageHash []string        `json:"expected_image_hash"`
}

func TestChainHelpers(t *testing.T) {
	root := filepath.Join("tests", "testdata")
	err := filepath.Walk(root, func(path string, info os.FileInfo, _ error) error {
		if filepath.Ext(path) != ".json" {
			return nil
		}

		data, readErr := os.ReadFile(path)
		if readErr != nil {
			return readErr
		}

		var cases []ChainHelperTestCase
		if err := json.Unmarshal(data, &cases); err != nil {
			return err
		}

		for _, tc := range cases {
			tc := tc // capture
			t.Run(tc.Name, func(t *testing.T) {
				var kp pb.KeysignPayload
				if err := protojson.Unmarshal(tc.KeysignPayloadRaw, &kp); err != nil {
					t.Fatalf("decode: %v", err)
				}

				got, err := helpers.ComputeImageHashes(&kp, vaultHexPub, vaultHexCode)
				if err != nil {
					t.Fatalf("hash: %v", err)
				}
				if !equalSlices(got, tc.ExpectedImageHash) {
					t.Errorf("mismatch\n got  %q\n want %q", got, tc.ExpectedImageHash)
				}
			})
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk: %v", err)
	}
}

func equalSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
