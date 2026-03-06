CREATE TABLE IF NOT EXISTS transaction_history (
    id TEXT PRIMARY KEY,
    vault_id TEXT NOT NULL REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    chain TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    explorer_url TEXT DEFAULT '',
    fiat_value TEXT DEFAULT '',
    data TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_tx_history_vault ON transaction_history(vault_id);
CREATE INDEX IF NOT EXISTS idx_tx_history_vault_type ON transaction_history(vault_id, type);
CREATE INDEX IF NOT EXISTS idx_tx_history_vault_timestamp ON transaction_history(vault_id, timestamp DESC);
