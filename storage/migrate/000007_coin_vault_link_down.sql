PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS coins;

CREATE TABLE coins (
    id TEXT PRIMARY KEY,
    public_key_ecdsa TEXT NOT NULL,
    chain TEXT NOT NULL,
    address TEXT NOT NULL,
    hex_public_key TEXT NOT NULL,
    ticker TEXT NOT NULL,
    contract_address TEXT NULL,
    is_native_token INTEGER NOT NULL DEFAULT 0,
    logo TEXT NOT NULL,
    price_provider_id TEXT NOT NULL,
    decimals INTEGER NOT NULL,
    FOREIGN KEY (public_key_ecdsa) REFERENCES vaults (public_key_ecdsa) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa ON coins (public_key_ecdsa);
CREATE INDEX IF NOT EXISTS idx_coins_chain ON coins (chain);
CREATE INDEX IF NOT EXISTS idx_coins_ticker ON coins (ticker);
CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa_chain ON coins (public_key_ecdsa, chain);

PRAGMA foreign_keys = ON;
