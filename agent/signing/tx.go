package signing

import (
	"encoding/hex"
	"fmt"
	"strings"

	ecommon "github.com/ethereum/go-ethereum/common"
	etypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/vultisig/recipes/chain/evm/ethereum"
)

var evmChains = map[string]bool{
	"Ethereum": true, "Base": true, "Arbitrum": true,
	"Polygon": true, "Optimism": true, "BSC": true,
	"BscChain": true, "Blast": true, "Avalanche": true,
	"CronosChain": true, "Zksync": true, "Mantle": true,
	"Hyperliquid": true, "Sei": true,
}

func VerifyTx(chain, unsignedTxHex, expectedHashHex string) error {
	if evmChains[chain] {
		return verifyEVMTx(unsignedTxHex, expectedHashHex)
	}
	return fmt.Errorf("tx verification not supported for chain: %s", chain)
}

func EncodeSignedTx(chain, unsignedTxHex, rHex, sHex, vHex string) ([]byte, error) {
	if evmChains[chain] {
		return encodeEVMSignedTx(unsignedTxHex, rHex, sHex, vHex)
	}
	return nil, fmt.Errorf("tx encoding not supported for chain: %s", chain)
}

func verifyEVMTx(unsignedTxHex, expectedHashHex string) error {
	unsignedTxHex = strings.TrimPrefix(unsignedTxHex, "0x")
	expectedHashHex = strings.TrimPrefix(expectedHashHex, "0x")

	unsignedTx, err := hex.DecodeString(unsignedTxHex)
	if err != nil {
		return fmt.Errorf("decode unsigned tx: %w", err)
	}

	txData, err := ethereum.DecodeUnsignedPayload(unsignedTx)
	if err != nil {
		return fmt.Errorf("decode payload: %w", err)
	}

	tx := etypes.NewTx(txData)
	signer := etypes.LatestSignerForChainID(tx.ChainId())
	computedHash := signer.Hash(tx)

	if computedHash.Hex() != "0x"+expectedHashHex {
		return fmt.Errorf("signing hash mismatch: computed %s, expected 0x%s", computedHash.Hex(), expectedHashHex)
	}

	return nil
}

func encodeEVMSignedTx(unsignedTxHex, rHex, sHex, vHex string) ([]byte, error) {
	unsignedTxHex = strings.TrimPrefix(unsignedTxHex, "0x")

	unsignedTx, err := hex.DecodeString(unsignedTxHex)
	if err != nil {
		return nil, fmt.Errorf("decode unsigned tx: %w", err)
	}

	txData, err := ethereum.DecodeUnsignedPayload(unsignedTx)
	if err != nil {
		return nil, fmt.Errorf("decode payload: %w", err)
	}

	r := ecommon.Hex2Bytes(strings.TrimPrefix(rHex, "0x"))
	s := ecommon.Hex2Bytes(strings.TrimPrefix(sHex, "0x"))
	v := ecommon.Hex2Bytes(strings.TrimPrefix(vHex, "0x"))

	var sig []byte
	sig = append(sig, r...)
	sig = append(sig, s...)
	sig = append(sig, v...)

	tx := etypes.NewTx(txData)
	signedTx, err := tx.WithSignature(etypes.LatestSignerForChainID(tx.ChainId()), sig)
	if err != nil {
		return nil, fmt.Errorf("apply signature: %w", err)
	}

	rawBytes, err := signedTx.MarshalBinary()
	if err != nil {
		return nil, fmt.Errorf("marshal signed tx: %w", err)
	}

	return rawBytes, nil
}
