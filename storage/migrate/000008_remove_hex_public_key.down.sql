-- Disable foreign key constraint checks
PRAGMA foreign_keys = OFF;

CREATE TABLE Coins_new (
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

-- Copy data, setting hex_public_key to address as a fallback since
-- we can't recover the original values
INSERT INTO Coins_new
SELECT 
    id,
    public_key_ecdsa,
    chain,
    address,
    address, -- Use address as a fallback for hex_public_key
    ticker,
    contract_address,
    is_native_token,
    logo,
    price_provider_id,
    decimals
FROM Coins;

DROP TABLE Coins;
ALTER TABLE Coins_new RENAME TO Coins;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa ON coins (public_key_ecdsa);
CREATE INDEX IF NOT EXISTS idx_coins_chain ON coins (chain);
CREATE INDEX IF NOT EXISTS idx_coins_ticker ON coins (ticker);
CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa_chain ON coins (public_key_ecdsa, chain); 

-- Re-enable foreign key constraint checks
PRAGMA foreign_keys = ON; 