CREATE TABLE
    IF NOT EXISTS vault_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "order" REAL NOT NULL DEFAULT 0
    );

PRAGMA foreign_keys = OFF;

CREATE TABLE
    IF NOT EXISTS vaults_new (
        public_key_ecdsa TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        local_party_id TEXT NOT NULL,
        public_key_eddsa TEXT NOT NULL,
        hex_chain_code TEXT NOT NULL,
        reshare_prefix TEXT NOT NULL DEFAULT '',
        signers TEXT NOT NULL,
        is_backedup INTEGER NOT NULL DEFAULT 0,
        "order" REAL NOT NULL DEFAULT 0,
        folder_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES vault_folders(id) ON DELETE SET NULL
    );

INSERT INTO vaults_new SELECT public_key_ecdsa, name, local_party_id, public_key_eddsa, hex_chain_code, reshare_prefix, signers, is_backedup, listorder as "order", NULL as folder_id,created_at FROM vaults;

DROP TABLE vaults;

ALTER TABLE vaults_new RENAME TO vaults;


CREATE INDEX IF NOT EXISTS idx_vaults_folder_id ON vaults (folder_id);
CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa_chain ON coins (public_key_ecdsa, chain);

PRAGMA foreign_keys = ON;
