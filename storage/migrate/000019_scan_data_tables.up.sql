CREATE TABLE IF NOT EXISTS zcash_scan_data (
    public_key_ecdsa TEXT PRIMARY KEY NOT NULL,
    z_address TEXT NOT NULL,
    scan_height INTEGER,
    scan_target INTEGER,
    birth_height INTEGER,
    birthday_scan_done INTEGER NOT NULL DEFAULT 0,
    pub_key_package TEXT NOT NULL DEFAULT '',
    sapling_extras TEXT NOT NULL DEFAULT '',
    notes_json TEXT NOT NULL DEFAULT '[]',
    nullifier_version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_zcash_scan_data_address ON zcash_scan_data(z_address);

CREATE TABLE IF NOT EXISTS monero_scan_data (
    public_key_ecdsa TEXT PRIMARY KEY NOT NULL,
    address TEXT NOT NULL,
    scan_height INTEGER,
    scan_target INTEGER,
    birth_height INTEGER,
    birthday_scan_done INTEGER NOT NULL DEFAULT 0,
    balance TEXT NOT NULL DEFAULT '0',
    wallet_keys_data TEXT,
    wallet_cache_data TEXT,
    outputs_json TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_monero_scan_data_address ON monero_scan_data(address);
