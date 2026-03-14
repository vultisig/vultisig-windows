ALTER TABLE monero_scan_data RENAME TO monero_scan_data_old;

CREATE TABLE monero_scan_data (
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

INSERT INTO monero_scan_data (
    public_key_ecdsa,
    address,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    balance,
    wallet_keys_data,
    wallet_cache_data,
    outputs_json
)
SELECT
    public_key_ecdsa,
    address,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    balance,
    wallet_keys_data,
    wallet_cache_data,
    '[]'
FROM monero_scan_data_old;

DROP TABLE monero_scan_data_old;

CREATE UNIQUE INDEX idx_monero_scan_data_address ON monero_scan_data(address);

ALTER TABLE zcash_scan_data RENAME TO zcash_scan_data_old;

CREATE TABLE zcash_scan_data (
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

INSERT INTO zcash_scan_data (
    public_key_ecdsa,
    z_address,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    pub_key_package,
    sapling_extras,
    notes_json,
    nullifier_version
)
SELECT
    public_key_ecdsa,
    z_address,
    scan_height,
    scan_target,
    birth_height,
    birthday_scan_done,
    pub_key_package,
    sapling_extras,
    notes_json,
    1
FROM zcash_scan_data_old;

DROP TABLE zcash_scan_data_old;

CREATE UNIQUE INDEX idx_zcash_scan_data_address ON zcash_scan_data(z_address);
