package tools

import (
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"github.com/vultisig/vultisig-win/storage"
)

type ListVaultsTool struct {
	store *storage.Store
}

func NewListVaultsTool(store *storage.Store) *ListVaultsTool {
	return &ListVaultsTool{store: store}
}

func (t *ListVaultsTool) Name() string {
	return "list_vaults"
}

func (t *ListVaultsTool) Description() string {
	return "List all vaults the user has. Returns vault names, chain addresses, and identifies the currently active vault. Use this to look up addresses for any vault (e.g., 'send to my Other vault')."
}

func (t *ListVaultsTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *ListVaultsTool) RequiresPassword() bool {
	return false
}

func (t *ListVaultsTool) RequiresConfirmation() bool {
	return false
}

func (t *ListVaultsTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	vaults, err := t.store.GetVaults()
	if err != nil {
		return nil, fmt.Errorf("failed to get vaults: %w", err)
	}

	allCoins, err := t.store.GetCoins()
	if err != nil {
		return nil, fmt.Errorf("failed to get coins: %w", err)
	}

	var vaultList []map[string]any
	for _, v := range vaults {
		isActive := v.PublicKeyECDSA == ctx.VaultPubKey

		chainAddresses := make(map[string]string)
		for _, coin := range allCoins[v.PublicKeyECDSA] {
			if _, exists := chainAddresses[coin.Chain]; !exists {
				chainAddresses[coin.Chain] = coin.Address
			}
		}

		vaultList = append(vaultList, map[string]any{
			"name":            v.Name,
			"is_active":       isActive,
			"isActive":        isActive,
			"signers":         len(v.Signers),
			"created_at":      v.CreatedAt.Format("2006-01-02"),
			"createdAt":       v.CreatedAt.Format("2006-01-02"),
			"chain_addresses": chainAddresses,
		})
	}

	return map[string]any{
		"vaults": vaultList,
		"count":  len(vaultList),
		"ui": map[string]any{
			"title": "Vaults",
		},
	}, nil
}

type RenameVaultTool struct {
	store *storage.Store
}

func NewRenameVaultTool(store *storage.Store) *RenameVaultTool {
	return &RenameVaultTool{store: store}
}

func (t *RenameVaultTool) Name() string {
	return "rename_vault"
}

func (t *RenameVaultTool) Description() string {
	return "Rename the current active vault. The new name must be 2-50 characters and unique among all vaults."
}

func (t *RenameVaultTool) InputSchema() map[string]any {
	return map[string]any{
		"new_name": map[string]any{
			"type":        "string",
			"description": "The new name for the vault (2-50 characters)",
		},
	}
}

func (t *RenameVaultTool) RequiresPassword() bool {
	return false
}

func (t *RenameVaultTool) RequiresConfirmation() bool {
	return false
}

func (t *RenameVaultTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	if ctx.Vault == nil {
		return nil, fmt.Errorf("vault not available in context")
	}

	newNameRaw, ok := input["new_name"]
	if !ok {
		return nil, fmt.Errorf("new_name is required")
	}
	newNameStr, ok := newNameRaw.(string)
	if !ok {
		return nil, fmt.Errorf("new_name must be a string")
	}
	newName := strings.TrimSpace(newNameStr)

	if len(newName) < 2 || len(newName) > 50 {
		return map[string]any{
			"success": false,
			"message": "Vault name must be between 2 and 50 characters",
		}, nil
	}

	vaults, err := t.store.GetVaults()
	if err != nil {
		return nil, fmt.Errorf("failed to get vaults: %w", err)
	}

	for _, v := range vaults {
		if v.PublicKeyECDSA != ctx.VaultPubKey && strings.EqualFold(v.Name, newName) {
			return map[string]any{
				"success": false,
				"message": fmt.Sprintf("A vault with the name '%s' already exists", newName),
			}, nil
		}
	}

	oldName := ctx.Vault.Name
	ctx.Vault.Name = newName

	err = t.store.SaveVault(ctx.Vault)
	if err != nil {
		return nil, fmt.Errorf("failed to save vault: %w", err)
	}

	runtime.EventsEmit(ctx.AppCtx, "vault:coins-changed")

	return map[string]any{
		"success":  true,
		"old_name": oldName,
		"new_name": newName,
		"message":  fmt.Sprintf("Successfully renamed vault from '%s' to '%s'", oldName, newName),
	}, nil
}
