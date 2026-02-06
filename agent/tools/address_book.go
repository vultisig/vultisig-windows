package tools

import (
	"fmt"

	"github.com/vultisig/vultisig-win/storage"
)

type GetAddressBookTool struct {
	store *storage.Store
}

func NewGetAddressBookTool(store *storage.Store) *GetAddressBookTool {
	return &GetAddressBookTool{store: store}
}

func (t *GetAddressBookTool) Name() string {
	return "get_address_book"
}

func (t *GetAddressBookTool) Description() string {
	return "Get all saved addresses from the address book. Returns a list of saved addresses with their titles, blockchain chains, and addresses."
}

func (t *GetAddressBookTool) InputSchema() map[string]any {
	return map[string]any{}
}

func (t *GetAddressBookTool) RequiresPassword() bool {
	return false
}

func (t *GetAddressBookTool) RequiresConfirmation() bool {
	return false
}

func (t *GetAddressBookTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	items, err := t.store.GetAllAddressBookItems()
	if err != nil {
		return nil, fmt.Errorf("failed to get address book: %w", err)
	}

	var entries []map[string]any
	for _, item := range items {
		entries = append(entries, map[string]any{
			"id":      item.ID,
			"title":   item.Title,
			"address": item.Address,
			"chain":   item.Chain,
		})
	}

	return map[string]any{
		"entries": entries,
		"count":   len(entries),
	}, nil
}

type AddAddressBookEntryTool struct {
	store *storage.Store
}

func NewAddAddressBookEntryTool(store *storage.Store) *AddAddressBookEntryTool {
	return &AddAddressBookEntryTool{store: store}
}

func (t *AddAddressBookEntryTool) Name() string {
	return "add_address_book_entry"
}

func (t *AddAddressBookEntryTool) Description() string {
	return "Add a new address to the address book. Useful for saving frequently used recipient addresses."
}

func (t *AddAddressBookEntryTool) InputSchema() map[string]any {
	return map[string]any{
		"title": map[string]any{
			"type":        "string",
			"description": "A friendly name/label for this address (e.g., 'My Exchange', 'Alice's Wallet')",
		},
		"address": map[string]any{
			"type":        "string",
			"description": "The blockchain address to save",
		},
		"chain": map[string]any{
			"type":        "string",
			"description": "The blockchain chain this address is for (e.g., 'Ethereum', 'Bitcoin')",
		},
	}
}

func (t *AddAddressBookEntryTool) RequiresPassword() bool {
	return false
}

func (t *AddAddressBookEntryTool) RequiresConfirmation() bool {
	return true
}

func (t *AddAddressBookEntryTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	titleRaw, ok := input["title"]
	if !ok {
		return nil, fmt.Errorf("title is required")
	}
	title := titleRaw.(string)

	addressRaw, ok := input["address"]
	if !ok {
		return nil, fmt.Errorf("address is required")
	}
	address := addressRaw.(string)

	chainRaw, ok := input["chain"]
	if !ok {
		return nil, fmt.Errorf("chain is required")
	}
	chain := chainRaw.(string)

	item := storage.AddressBookItem{
		Title:   title,
		Address: address,
		Chain:   chain,
	}

	id, err := t.store.SaveAddressBookItem(item)
	if err != nil {
		return nil, fmt.Errorf("failed to save address book entry: %w", err)
	}

	return map[string]any{
		"success": true,
		"id":      id,
		"title":   title,
		"address": address,
		"chain":   chain,
		"message": fmt.Sprintf("Successfully added '%s' to address book", title),
	}, nil
}

type RemoveAddressBookEntryTool struct {
	store *storage.Store
}

func NewRemoveAddressBookEntryTool(store *storage.Store) *RemoveAddressBookEntryTool {
	return &RemoveAddressBookEntryTool{store: store}
}

func (t *RemoveAddressBookEntryTool) Name() string {
	return "remove_address_book_entry"
}

func (t *RemoveAddressBookEntryTool) Description() string {
	return "Remove an address from the address book by its ID."
}

func (t *RemoveAddressBookEntryTool) InputSchema() map[string]any {
	return map[string]any{
		"id": map[string]any{
			"type":        "string",
			"description": "The unique ID of the address book entry to remove",
		},
	}
}

func (t *RemoveAddressBookEntryTool) RequiresPassword() bool {
	return false
}

func (t *RemoveAddressBookEntryTool) RequiresConfirmation() bool {
	return true
}

func (t *RemoveAddressBookEntryTool) Execute(input map[string]any, ctx *ExecutionContext) (any, error) {
	idRaw, ok := input["id"]
	if !ok {
		return nil, fmt.Errorf("id is required")
	}
	id := idRaw.(string)

	item, err := t.store.GetAddressBookItem(id)
	if err != nil {
		return map[string]any{
			"success": false,
			"message": "Address book entry not found",
		}, nil
	}

	err = t.store.DeleteAddressBookItem(id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete address book entry: %w", err)
	}

	return map[string]any{
		"success": true,
		"title":   item.Title,
		"message": fmt.Sprintf("Successfully removed '%s' from address book", item.Title),
	}, nil
}
