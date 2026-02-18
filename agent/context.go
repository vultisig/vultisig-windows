package agent

import (
	"context"
	"math/big"
	"strings"
	"sync"

	"github.com/vultisig/vultisig-win/agent/backend"
	"github.com/vultisig/vultisig-win/agent/balancebridge"
	"github.com/vultisig/vultisig-win/storage"
)

func buildQuickMessageContext(vault *storage.Vault, store *storage.Store) *backend.MessageContext {
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

func buildMessageContext(appCtx, waitCtx context.Context, vault *storage.Vault, store *storage.Store) *backend.MessageContext {
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

	msgCtx := &backend.MessageContext{
		VaultAddress: vault.PublicKeyECDSA,
		VaultName:    vault.Name,
		Balances:     balances,
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

	bal.Amount = formatHumanBalance(raw, int(coin.Decimals))
	return bal
}

func formatHumanBalance(balance *big.Int, decimals int) string {
	if balance == nil || balance.Sign() == 0 {
		return "0"
	}

	divisor := new(big.Int).Exp(big.NewInt(10), big.NewInt(int64(decimals)), nil)
	whole := new(big.Int).Div(balance, divisor)
	remainder := new(big.Int).Mod(balance, divisor)

	if remainder.Sign() == 0 {
		return whole.String()
	}

	remainderStr := remainder.String()
	for len(remainderStr) < decimals {
		remainderStr = "0" + remainderStr
	}
	remainderStr = strings.TrimRight(remainderStr, "0")
	if remainderStr == "" {
		return whole.String()
	}
	if len(remainderStr) > 8 {
		remainderStr = remainderStr[:8]
	}
	return whole.String() + "." + remainderStr
}
