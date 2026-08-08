package storage

import (
	"path/filepath"
	"testing"
	"time"
)

func TestSaveVaultUpdatePreservesChildRows(t *testing.T) {
	store := newTestStore(t)

	vault := testVault()
	if err := store.SaveVault(vault); err != nil {
		t.Fatal(err)
	}

	coin := Coin{
		ID:              "coin-1",
		Chain:           "Bitcoin",
		Address:         "bc1qtest",
		Ticker:          "BTC",
		IsNativeToken:   true,
		Logo:            "btc.png",
		PriceProviderID: "bitcoin",
		Decimals:        8,
	}
	if _, err := store.SaveCoin(vault.PublicKeyECDSA, coin); err != nil {
		t.Fatal(err)
	}

	record := TransactionRecord{
		ID:          "tx-1",
		VaultID:     vault.PublicKeyECDSA,
		Type:        "send",
		Status:      "pending",
		Chain:       "Bitcoin",
		Timestamp:   "2026-06-14T00:00:00Z",
		TxHash:      "tx-hash-1",
		ExplorerURL: "https://example.com/tx/tx-hash-1",
		FiatValue:   "1.00",
		Data:        "{}",
	}
	if err := store.SaveTransactionRecord(record); err != nil {
		t.Fatal(err)
	}

	update := *vault
	update.Name = "Renamed Vault"
	update.KeyShares = nil
	update.Coins = nil
	if err := store.SaveVault(&update); err != nil {
		t.Fatal(err)
	}

	savedVault, err := store.GetVault(vault.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if savedVault.Name != update.Name {
		t.Fatalf("expected vault name %q, got %q", update.Name, savedVault.Name)
	}
	if len(savedVault.KeyShares) != len(vault.KeyShares) {
		t.Fatalf("expected %d keyshares, got %d", len(vault.KeyShares), len(savedVault.KeyShares))
	}

	coins, err := store.GetVaultCoins(vault.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if len(coins) != 1 || coins[0].ID != coin.ID {
		t.Fatalf("expected saved coin %q to survive vault update, got %#v", coin.ID, coins)
	}

	records, err := store.GetTransactionRecords(vault.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if len(records) != 1 || records[0].ID != record.ID {
		t.Fatalf("expected transaction record %q to survive vault update, got %#v", record.ID, records)
	}
}

func newTestStore(t *testing.T) *Store {
	t.Helper()

	t.Setenv("VULTISIG_DB_PATH", filepath.Join(t.TempDir(), "test.db"))
	store, err := NewStore()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Fatal(err)
		}
	})

	if err := store.Migrate(); err != nil {
		t.Fatal(err)
	}

	return store
}

func testVault() *Vault {
	return &Vault{
		Name:           "Test Vault",
		PublicKeyECDSA: "test-public-key-ecdsa",
		PublicKeyEdDSA: "test-public-key-eddsa",
		Signers:        []string{"test-signer"},
		CreatedAt:      time.Unix(1, 0).UTC(),
		HexChainCode:   "test-chain-code",
		KeyShares: []KeyShare{
			{
				PublicKey: "test-public-key-ecdsa",
				KeyShare:  "ecdsa-share",
			},
			{
				PublicKey: "test-public-key-eddsa",
				KeyShare:  "eddsa-share",
			},
		},
		LocalPartyID: "test-party",
		LibType:      "DKLS",
	}
}
