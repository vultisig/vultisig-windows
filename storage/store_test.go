package storage

import (
	"context"
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

func TestSaveVaultsKeySharesRollsBackFailedChainKeyShareWrite(t *testing.T) {
	store := newTestStore(t)

	vault := testVault()
	if err := store.SaveVault(vault); err != nil {
		t.Fatal(err)
	}

	// Pin the pool to a single connection so a leaked transaction starves
	// every later write instead of silently grabbing a fresh connection.
	store.db.SetMaxOpenConns(1)

	// Fail only the chain-keyshare UPDATE, so the preceding DELETE and INSERT
	// still succeed and the transaction is open when the error surfaces.
	if _, err := store.db.Exec(`CREATE TRIGGER fail_vault_update BEFORE UPDATE ON vaults
		BEGIN SELECT RAISE(ABORT, 'forced update failure'); END;`); err != nil {
		t.Fatal(err)
	}

	err := store.SaveVaultsKeyShares(map[string]VaultAllKeyShares{
		vault.PublicKeyECDSA: {
			KeyShares:      vault.KeyShares,
			ChainKeyShares: map[string]string{"Bitcoin": "chain-share"},
		},
	})
	if err == nil {
		t.Fatal("expected chain key share update to fail")
	}

	// The deferred rollback must have released the transaction. If err was
	// shadowed the rollback never ran, and this write blocks on the pinned
	// connection until the context deadline.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, err := store.db.ExecContext(ctx, "SELECT 1"); err != nil {
		t.Fatalf("transaction was not released, subsequent write failed: %v", err)
	}
}

func TestReplaceVaultAtomicallyReplacesExactRecoverySnapshot(t *testing.T) {
	store := newTestStore(t)
	stored := testVault()
	stored.KeyShares[0].KeyShare = "unreadable-ecdsa"
	stored.KeyShares[1].KeyShare = "unreadable-eddsa"
	if err := store.SaveVault(stored); err != nil {
		t.Fatal(err)
	}

	expected, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	replacement := *expected
	replacement.Name = "Recovered Vault"
	replacement.KeyShares = []KeyShare{
		{PublicKey: stored.PublicKeyECDSA, KeyShare: "recovered-ecdsa"},
		{PublicKey: stored.PublicKeyEdDSA, KeyShare: "recovered-eddsa"},
	}

	if err := store.ReplaceVault(expected, &replacement); err != nil {
		t.Fatal(err)
	}
	saved, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if saved.Name != replacement.Name || !sameStringMap(
		keySharesByPublicKey(saved.KeyShares),
		keySharesByPublicKey(replacement.KeyShares),
	) {
		t.Fatalf("unexpected recovered vault: %#v", saved)
	}
}

func TestReplaceVaultRejectsDroppedStoredIdentity(t *testing.T) {
	store := newTestStore(t)
	stored := testVault()
	if err := store.SaveVault(stored); err != nil {
		t.Fatal(err)
	}
	expected, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	replacement := *expected
	replacement.PublicKeyEdDSA = "different-eddsa"
	replacement.KeyShares = []KeyShare{
		{PublicKey: stored.PublicKeyECDSA, KeyShare: "recovered-ecdsa"},
		{PublicKey: replacement.PublicKeyEdDSA, KeyShare: "recovered-eddsa"},
	}

	if err := store.ReplaceVault(expected, &replacement); err == nil {
		t.Fatal("expected identity-changing recovery to be rejected")
	}
}

func TestReplaceVaultRejectsStaleRecoverySnapshot(t *testing.T) {
	store := newTestStore(t)
	stored := testVault()
	if err := store.SaveVault(stored); err != nil {
		t.Fatal(err)
	}
	expected, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}

	concurrent := *expected
	concurrent.KeyShares = append([]KeyShare(nil), expected.KeyShares...)
	concurrent.KeyShares[0].KeyShare = "already-recovered"
	if err := store.SaveVault(&concurrent); err != nil {
		t.Fatal(err)
	}

	replacement := *expected
	replacement.Name = "Stale overwrite"
	if err := store.ReplaceVault(expected, &replacement); err == nil {
		t.Fatal("expected stale recovery snapshot to be rejected")
	}
	saved, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if keySharesByPublicKey(saved.KeyShares)[stored.PublicKeyECDSA] != "already-recovered" {
		t.Fatal("stale recovery overwrote the newer keyshare")
	}
}

func TestReplaceVaultRollsBackMetadataAndKeysharesTogether(t *testing.T) {
	store := newTestStore(t)
	stored := testVault()
	if err := store.SaveVault(stored); err != nil {
		t.Fatal(err)
	}
	expected, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	replacement := *expected
	replacement.Name = "Must roll back"
	replacement.KeyShares = []KeyShare{
		{PublicKey: stored.PublicKeyECDSA, KeyShare: "recovered-ecdsa"},
		{PublicKey: stored.PublicKeyEdDSA, KeyShare: "force-recovery-failure"},
	}
	if _, err := store.db.Exec(`CREATE TRIGGER fail_recovery_keyshare BEFORE INSERT ON keyshares
		WHEN NEW.keyshare = 'force-recovery-failure'
		BEGIN SELECT RAISE(ABORT, 'forced recovery failure'); END;`); err != nil {
		t.Fatal(err)
	}

	if err := store.ReplaceVault(expected, &replacement); err == nil {
		t.Fatal("expected replacement write to fail")
	}
	saved, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if saved.Name != stored.Name || !sameStringMap(
		keySharesByPublicKey(saved.KeyShares),
		keySharesByPublicKey(stored.KeyShares),
	) {
		t.Fatalf("failed replacement was not rolled back: %#v", saved)
	}
}

func TestSaveVaultRollsBackMetadataWhenKeyshareWriteFails(t *testing.T) {
	store := newTestStore(t)
	stored := testVault()
	if err := store.SaveVault(stored); err != nil {
		t.Fatal(err)
	}
	if _, err := store.db.Exec(`CREATE TRIGGER fail_vault_keyshare BEFORE INSERT ON keyshares
		WHEN NEW.keyshare = 'force-save-failure'
		BEGIN SELECT RAISE(ABORT, 'forced save failure'); END;`); err != nil {
		t.Fatal(err)
	}

	update := *stored
	update.Name = "Must roll back"
	update.KeyShares = []KeyShare{
		{PublicKey: stored.PublicKeyECDSA, KeyShare: "updated-ecdsa"},
		{PublicKey: stored.PublicKeyEdDSA, KeyShare: "force-save-failure"},
	}
	if err := store.SaveVault(&update); err == nil {
		t.Fatal("expected vault save to fail")
	}
	saved, err := store.GetVault(stored.PublicKeyECDSA)
	if err != nil {
		t.Fatal(err)
	}
	if saved.Name != stored.Name || !sameStringMap(
		keySharesByPublicKey(saved.KeyShares),
		keySharesByPublicKey(stored.KeyShares),
	) {
		t.Fatalf("failed vault save was not rolled back: %#v", saved)
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
