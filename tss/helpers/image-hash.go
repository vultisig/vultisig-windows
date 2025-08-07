package helpers

import (
	"fmt"

	"github.com/vultisig/mobile-tss-lib/evm"
	"github.com/vultisig/mobile-tss-lib/utxo"
	pb "github.com/vultisig/vultisig-win/commondata/proto/vultisig/keysign"
	// … import the rest
)

func ComputeImageHashes(kp *pb.KeysignPayload, vaultHexPub, vaultHexCC string) ([]string, error) {
	if kp.SwapPayload != nil && kp.SwapPayload.GetMayachain() == nil {
		return computeSwapHashes(kp, vaultHexPub, vaultHexCC)
	}

	var out []string
	switch kp.Coin.Chain {
	case pb.Chain_BITCOIN,
		pb.Chain_BITCOIN_CASH,
		pb.Chain_DOGECOIN,
		pb.Chain_LITECOIN,
		pb.Chain_ZCASH:
		h := utxo.NewHelper(kp.Coin.Chain, vaultHexPub, vaultHexCC)
		hash, err := h.PreSignedImageHash(kp)
		if err != nil {
			return nil, err
		}
		out = append(out, hash...)

	case pb.Chain_ETHEREUM,
		pb.Chain_ARBITRUM,
		pb.Chain_OPTIMISM,
		pb.Chain_POLYGON,
		pb.Chain_BASE,
		pb.Chain_BSC_CHAIN,
		pb.Chain_AVALANCHE:
		if kp.Coin.ContractAddress == "" {
			h := evm.NewNativeHelper(kp.Coin, vaultHexPub, vaultHexCC)
			hash, err := h.PreSignedImageHash(kp)
			if err != nil { return nil, err }
			out = append(out, hash...)
		} else {
			h := evm.NewERC20Helper(kp.Coin, vaultHexPub, vaultHexCC)
			hash, err := h.PreSignedImageHash(kp)
			if err != nil { return nil, err }
			out = append(out, hash...)
		}

	// …repeat the rest of the switch from Swift (THORChain, Solana, Terra, etc.)

	default:
		return nil, fmt.Errorf("unsupported chain %v", kp.Coin.Chain)
	}
	return out, nil
}
