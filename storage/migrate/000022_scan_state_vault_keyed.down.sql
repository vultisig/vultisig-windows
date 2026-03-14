ALTER TABLE zcash_scan_data RENAME TO zcash_scan_data_vault_old;

CREATE TABLE zcash_scan_data (
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

INSERT INTO zcash_scan_data (
    z_address,
    public_key_ecdsa,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    pub_key_package,
    sapling_extras,
    notes_json
)
SELECT
    z_address,
    public_key_ecdsa,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    pub_key_package,
    sapling_extras,
    notes_json
FROM zcash_scan_data_vault_old;

DROP TABLE zcash_scan_data_vault_old;

CREATE INDEX idx_zcash_scan_data_vault ON zcash_scan_data(public_key_ecdsa);

ALTER TABLE monero_scan_data RENAME TO monero_scan_data_vault_old;

CREATE TABLE monero_scan_data (
    address TEXT PRIMARY KEY NOT NULL,
    public_key_ecdsa TEXT NOT NULL,
    scan_height INTEGER,
    scan_target INTEGER,
    birth_height INTEGER,
    birthday_scan_done INTEGER NOT NULL DEFAULT 0,
    balance TEXT NOT NULL DEFAULT '0',
    wallet_keys_data TEXT,
    wallet_cache_data TEXT,
    FOREIGN KEY (public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
);

INSERT INTO monero_scan_data (
    address,
    public_key_ecdsa,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    balance,
    wallet_keys_data,
    wallet_cache_data
)
SELECT
    address,
    public_key_ecdsa,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    balance,
    wallet_keys_data,
    wallet_cache_data
FROM monero_scan_data_vault_old;

DROP TABLE monero_scan_data_vault_old;

CREATE INDEX idx_monero_scan_data_vault ON monero_scan_data(public_key_ecdsa);
