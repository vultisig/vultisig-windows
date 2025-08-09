package tests

import "encoding/json"

type Case struct {
    Name              string            `json:"name"`
    KeysignPayload    json.RawMessage   `json:"keysign_payload"`
    ExpectedImageHash []string          `json:"expected_image_hash"`
}