CREATE TABLE IF NOT EXISTS zcash_scan_data (
    z_address TEXT PRIMARY KEY NOT NULL,
    public_key_ecdsa TEXT NOT NULL,
    scan_height INTEGER,
    scan_target INTEGER,
    birth_height INTEGER,
    birthday_scan_done INTEGER NOT NULL DEFAULT 0,
    pub_key_package TEXT NOT NULL DEFAULT '',
    sapling_extras TEXT NOT NULL DEFAULT '',
    notes_json TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_zcash_scan_data_vault ON zcash_scan_data(public_key_ecdsa);
