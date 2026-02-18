package signing

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/sha3"
)

var evmRPCURLs = map[string]string{
	"Ethereum":    "https://api.vultisig.com/eth/",
	"Base":        "https://api.vultisig.com/base/",
	"Arbitrum":    "https://api.vultisig.com/arb/",
	"Polygon":     "https://api.vultisig.com/polygon/",
	"Optimism":    "https://api.vultisig.com/opt/",
	"BSC":         "https://api.vultisig.com/bsc/",
	"BscChain":    "https://api.vultisig.com/bsc/",
	"Blast":       "https://api.vultisig.com/blast/",
	"Avalanche":   "https://api.vultisig.com/avax/",
	"CronosChain": "https://cronos-evm-rpc.publicnode.com",
	"Zksync":      "https://api.vultisig.com/zksync/",
}

func GetEVMRPCURL(chain string) (string, error) {
	url, ok := evmRPCURLs[chain]
	if !ok {
		return "", fmt.Errorf("unsupported EVM chain: %s", chain)
	}
	return url, nil
}

type EVMTxParams struct {
	Nonce    uint64
	GasPrice *big.Int
	GasLimit uint64
	To       []byte
	Value    *big.Int
	Data     []byte
	ChainID  *big.Int
}

func EncodeUnsignedTxForSigning(tx *EVMTxParams) []byte {
	items := [][]byte{
		rlpEncodeUint(tx.Nonce),
		rlpEncodeBigInt(tx.GasPrice),
		rlpEncodeUint(tx.GasLimit),
		rlpEncodeBytes(tx.To),
		rlpEncodeBigInt(tx.Value),
		rlpEncodeBytes(tx.Data),
		rlpEncodeBigInt(tx.ChainID),
		rlpEncodeUint(0),
		rlpEncodeUint(0),
	}
	return rlpEncodeList(items...)
}

func EncodeSignedTx(tx *EVMTxParams, v, r, s *big.Int) []byte {
	items := [][]byte{
		rlpEncodeUint(tx.Nonce),
		rlpEncodeBigInt(tx.GasPrice),
		rlpEncodeUint(tx.GasLimit),
		rlpEncodeBytes(tx.To),
		rlpEncodeBigInt(tx.Value),
		rlpEncodeBytes(tx.Data),
		rlpEncodeBigInt(v),
		rlpEncodeBigInt(r),
		rlpEncodeBigInt(s),
	}
	return rlpEncodeList(items...)
}

func ComputeSigningHash(tx *EVMTxParams) []byte {
	encoded := EncodeUnsignedTxForSigning(tx)
	return Keccak256(encoded)
}

func Keccak256(data []byte) []byte {
	hasher := sha3.NewLegacyKeccak256()
	hasher.Write(data)
	return hasher.Sum(nil)
}

func ParseSignature(sigHex string, chainID *big.Int) (v, r, s *big.Int, err error) {
	sigHex = strings.TrimPrefix(sigHex, "0x")
	if len(sigHex) != 130 {
		return nil, nil, nil, fmt.Errorf("invalid signature length: %d", len(sigHex))
	}

	rBytes, err := hex.DecodeString(sigHex[:64])
	if err != nil {
		return nil, nil, nil, fmt.Errorf("decode R: %w", err)
	}
	sBytes, err := hex.DecodeString(sigHex[64:128])
	if err != nil {
		return nil, nil, nil, fmt.Errorf("decode S: %w", err)
	}
	vStr := sigHex[128:130]

	r = new(big.Int).SetBytes(rBytes)
	s = new(big.Int).SetBytes(sBytes)

	var recoveryBit int64
	switch vStr {
	case "00", "1b":
		recoveryBit = 0
	case "01", "1c":
		recoveryBit = 1
	default:
		vByte, parseErr := hex.DecodeString(vStr)
		if parseErr != nil {
			return nil, nil, nil, fmt.Errorf("invalid recovery ID: %s", vStr)
		}
		recoveryBit = int64(vByte[0])
		if recoveryBit >= 27 {
			recoveryBit -= 27
		}
	}

	v = new(big.Int).Mul(chainID, big.NewInt(2))
	v.Add(v, big.NewInt(35+recoveryBit))

	return v, r, s, nil
}

func ParseHexAddress(addrHex string) ([]byte, error) {
	addrHex = strings.TrimPrefix(addrHex, "0x")
	if len(addrHex) != 40 {
		return nil, fmt.Errorf("invalid address length: %d", len(addrHex))
	}
	return hex.DecodeString(addrHex)
}

func ParseHexData(dataHex string) ([]byte, error) {
	dataHex = strings.TrimPrefix(dataHex, "0x")
	if len(dataHex) == 0 {
		return nil, nil
	}
	return hex.DecodeString(dataHex)
}

func ParseValue(valueStr string) (*big.Int, error) {
	if valueStr == "" || valueStr == "0" {
		return big.NewInt(0), nil
	}

	if strings.HasPrefix(valueStr, "0x") {
		v, ok := new(big.Int).SetString(strings.TrimPrefix(valueStr, "0x"), 16)
		if !ok {
			return nil, fmt.Errorf("invalid hex value: %s", valueStr)
		}
		return v, nil
	}

	v, ok := new(big.Int).SetString(valueStr, 10)
	if !ok {
		return nil, fmt.Errorf("invalid value: %s", valueStr)
	}
	return v, nil
}

// RLP encoding

func rlpEncodeBytes(b []byte) []byte {
	if len(b) == 0 {
		return []byte{0x80}
	}
	if len(b) == 1 && b[0] < 0x80 {
		return b
	}
	if len(b) < 56 {
		return append([]byte{byte(0x80 + len(b))}, b...)
	}
	lenBytes := encodeBigEndian(uint64(len(b)))
	result := append([]byte{byte(0xb7 + len(lenBytes))}, lenBytes...)
	return append(result, b...)
}

func rlpEncodeUint(n uint64) []byte {
	if n == 0 {
		return []byte{0x80}
	}
	return rlpEncodeBytes(encodeBigEndian(n))
}

func rlpEncodeBigInt(n *big.Int) []byte {
	if n == nil || n.Sign() == 0 {
		return []byte{0x80}
	}
	return rlpEncodeBytes(n.Bytes())
}

func rlpEncodeList(items ...[]byte) []byte {
	var payload []byte
	for _, item := range items {
		payload = append(payload, item...)
	}
	if len(payload) < 56 {
		return append([]byte{byte(0xc0 + len(payload))}, payload...)
	}
	lenBytes := encodeBigEndian(uint64(len(payload)))
	result := append([]byte{byte(0xf7 + len(lenBytes))}, lenBytes...)
	return append(result, payload...)
}

func encodeBigEndian(n uint64) []byte {
	if n == 0 {
		return nil
	}
	var buf []byte
	for n > 0 {
		buf = append([]byte{byte(n & 0xff)}, buf...)
		n >>= 8
	}
	return buf
}

// JSON-RPC

type jsonRPCRequest struct {
	JSONRPC string `json:"jsonrpc"`
	Method  string `json:"method"`
	Params  []any  `json:"params"`
	ID      int    `json:"id"`
}

type jsonRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	Result  json.RawMessage `json:"result"`
	Error   *jsonRPCError   `json:"error"`
	ID      int             `json:"id"`
}

type jsonRPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

var rpcHTTPClient = &http.Client{Timeout: 30 * time.Second}

func callRPC(ctx context.Context, rpcURL, method string, params []any) (json.RawMessage, error) {
	req := jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
		ID:      1,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal RPC request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, rpcURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := rpcHTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("send RPC request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read RPC response: %w", err)
	}

	var rpcResp jsonRPCResponse
	err = json.Unmarshal(respBody, &rpcResp)
	if err != nil {
		return nil, fmt.Errorf("unmarshal RPC response: %w", err)
	}

	if rpcResp.Error != nil {
		return nil, fmt.Errorf("RPC error %d: %s", rpcResp.Error.Code, rpcResp.Error.Message)
	}

	return rpcResp.Result, nil
}

func GetGasPrice(ctx context.Context, rpcURL string) (*big.Int, error) {
	result, err := callRPC(ctx, rpcURL, "eth_gasPrice", []any{})
	if err != nil {
		return nil, err
	}

	var hexPrice string
	err = json.Unmarshal(result, &hexPrice)
	if err != nil {
		return nil, fmt.Errorf("unmarshal gas price: %w", err)
	}

	price, ok := new(big.Int).SetString(strings.TrimPrefix(hexPrice, "0x"), 16)
	if !ok {
		return nil, fmt.Errorf("invalid gas price: %s", hexPrice)
	}

	return price, nil
}

func GetNonce(ctx context.Context, rpcURL, address string) (uint64, error) {
	result, err := callRPC(ctx, rpcURL, "eth_getTransactionCount", []any{address, "pending"})
	if err != nil {
		return 0, err
	}

	var hexNonce string
	err = json.Unmarshal(result, &hexNonce)
	if err != nil {
		return 0, fmt.Errorf("unmarshal nonce: %w", err)
	}

	nonce, ok := new(big.Int).SetString(strings.TrimPrefix(hexNonce, "0x"), 16)
	if !ok {
		return 0, fmt.Errorf("invalid nonce: %s", hexNonce)
	}

	return nonce.Uint64(), nil
}

func BroadcastTx(ctx context.Context, rpcURL string, signedTx []byte) (string, error) {
	txHex := "0x" + hex.EncodeToString(signedTx)

	result, err := callRPC(ctx, rpcURL, "eth_sendRawTransaction", []any{txHex})
	if err != nil {
		return "", err
	}

	var txHash string
	err = json.Unmarshal(result, &txHash)
	if err != nil {
		return "", fmt.Errorf("unmarshal tx hash: %w", err)
	}

	return txHash, nil
}

type TxPollStatus struct {
	Status string
	Error  string
}

func PollTxStatus(ctx context.Context, rpcURL, txHash string, onStatus func(TxPollStatus)) {
	onStatus(TxPollStatus{Status: "pending"})

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			result, err := callRPC(ctx, rpcURL, "eth_getTransactionReceipt", []any{txHash})
			if err != nil {
				continue
			}
			if string(result) == "null" {
				continue
			}
			var receipt struct {
				Status string `json:"status"`
			}
			err = json.Unmarshal(result, &receipt)
			if err != nil {
				continue
			}
			if receipt.Status == "0x1" {
				onStatus(TxPollStatus{Status: "confirmed"})
				return
			}
			onStatus(TxPollStatus{Status: "failed", Error: fmt.Sprintf("reverted (status: %s)", receipt.Status)})
			return
		}
	}
}

func WaitForReceipt(ctx context.Context, rpcURL, txHash string) error {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			result, err := callRPC(ctx, rpcURL, "eth_getTransactionReceipt", []any{txHash})
			if err != nil {
				continue
			}
			if string(result) == "null" {
				continue
			}
			var receipt struct {
				Status string `json:"status"`
			}
			err = json.Unmarshal(result, &receipt)
			if err != nil {
				continue
			}
			if receipt.Status == "0x1" {
				return nil
			}
			return fmt.Errorf("transaction reverted (status: %s)", receipt.Status)
		}
	}
}
