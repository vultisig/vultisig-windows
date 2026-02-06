package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/storage"
)

type VaultInfoTool struct {
	store *storage.Store
}

func NewVaultInfoTool(store *storage.Store) *VaultInfoTool {
	return &VaultInfoTool{store: store}
}

func (t *VaultInfoTool) Name() string {
	return "vault_info"
}

func (t *VaultInfoTool) Description() string {
	return "Get information about the current vault including addresses and tracked coins."
}

func (t *VaultInfoTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *VaultInfoTool) RequiresPassword() bool {
	return false
}

func (t *VaultInfoTool) RequiresConfirmation() bool {
	return false
}

func (t *VaultInfoTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	vault := ctx.Vault

	var coins []map[string]any
	for _, coin := range vault.Coins {
		coins = append(coins, map[string]any{
			"chain":            coin.Chain,
			"ticker":           coin.Ticker,
			"address":          coin.Address,
			"contract_address": coin.ContractAddress,
			"is_native":        coin.IsNativeToken,
			"decimals":         coin.Decimals,
		})
	}

	return map[string]any{
		"name":             vault.Name,
		"public_key_ecdsa": vault.PublicKeyECDSA,
		"public_key_eddsa": vault.PublicKeyEdDSA,
		"signers":          vault.Signers,
		"local_party_id":   vault.LocalPartyID,
		"coins":            coins,
		"is_backed_up":     vault.IsBackedUp,
		"lib_type":         vault.LibType,
	}, nil
}
