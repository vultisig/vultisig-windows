package agent

import (
	"context"
	"math/big"
	"sync"

	"github.com/vultisig/vultisig-win/agent/backend"
	"github.com/vultisig/vultisig-win/agent/balancebridge"
	"github.com/vultisig/vultisig-win/agent/shared"
	"github.com/vultisig/vultisig-win/storage"
)

func buildBaseMessageContext(vault *storage.Vault, store *storage.Store) *backend.MessageContext {
	addresses := make(map[string]string)
	for _, coin := range vault.Coins {
		if coin.IsNativeToken && coin.Address != "" {
			if _, exists := addresses[coin.Chain]; !exists {
				addresses[coin.Chain] = coin.Address
			}
		}
	}

	coins := make([]backend.CoinInfo, len(vault.Coins))
	for i, coin := range vault.Coins {
		coins[i] = backend.CoinInfo{
			Chain:           coin.Chain,
			Ticker:          coin.Ticker,
			ContractAddress: coin.ContractAddress,
			IsNativeToken:   coin.IsNativeToken,
			Decimals:        int(coin.Decimals),
		}
	}

	msgCtx := &backend.MessageContext{
		VaultAddress: vault.PublicKeyECDSA,
		VaultName:    vault.Name,
		Addresses:    addresses,
		Coins:        coins,
	}

	if store != nil {
		items, err := store.GetAllAddressBookItems()
		if err == nil && len(items) > 0 {
			entries := make([]backend.AddressBookEntry, 0, len(items))
			for _, item := range items {
				entries = append(entries, backend.AddressBookEntry{
					Title:   item.Title,
					Address: item.Address,
					Chain:   item.Chain,
				})
			}
			msgCtx.AddressBook = entries
		}
	}

	return msgCtx
}

func buildQuickMessageContext(vault *storage.Vault, store *storage.Store) *backend.MessageContext {
	return buildBaseMessageContext(vault, store)
}

func buildMessageContext(appCtx, waitCtx context.Context, vault *storage.Vault, store *storage.Store) *backend.MessageContext {
	msgCtx := buildBaseMessageContext(vault, store)

	balances := make([]backend.Balance, len(vault.Coins))
	var wg sync.WaitGroup
	for i, coin := range vault.Coins {
		wg.Add(1)
		go func(idx int, c storage.Coin) {
			defer wg.Done()
			balances[idx] = fetchCoinBalance(appCtx, waitCtx, c)
		}(i, coin)
	}
	wg.Wait()

	msgCtx.Balances = balances
	return msgCtx
}

func fetchCoinBalance(appCtx, waitCtx context.Context, coin storage.Coin) backend.Balance {
	bal := backend.Balance{
		Chain:    coin.Chain,
		Asset:    coin.ContractAddress,
		Symbol:   coin.Ticker,
		Decimals: int(coin.Decimals),
		Amount:   "0",
	}

	id := ""
	if !coin.IsNativeToken && coin.ContractAddress != "" {
		id = coin.ContractAddress
	}

	resp, err := balancebridge.RequestBalance(appCtx, waitCtx, balancebridge.BalanceRequest{
		Chain:   coin.Chain,
		Address: coin.Address,
		ID:      id,
	})
	if err != nil {
		return bal
	}

	raw := new(big.Int)
	_, ok := raw.SetString(resp.Balance, 10)
	if !ok {
		return bal
	}

	bal.Amount = shared.FormatBalance(raw, int(coin.Decimals), 8)
	return bal
}
