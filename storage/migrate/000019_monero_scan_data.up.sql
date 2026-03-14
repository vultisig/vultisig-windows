CREATE TABLE IF NOT EXISTS monero_scan_data (
    address TEXT PRIMARY KEY NOT NULL,
    public_key_ecdsa TEXT NOT NULL,
    scan_height INTEGER,
    scan_target INTEGER,
    birth_height INTEGER,
    birthday_scan_done INTEGER NOT NULL DEFAULT 0,
    balance TEXT NOT NULL DEFAULT '0',
    FOREIGN KEY (public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monero_scan_data_vault ON monero_scan_data(public_key_ecdsa);
