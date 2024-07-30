CREATE TABLE IF NOT EXISTS vaults (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    local_party_id TEXT NOT NULL,
    public_key_ecdsa TEXT NOT NULL,
    public_key_eddsa TEXT NOT NULL,
    hex_chain_code  TEXT NOT NULL ,
    reshare_prefix TEXT NOT NULL DEFAULT '',
    signers TEXT NOT NULL,
    is_backedup INTEGER NOT NULL DEFAULT 0,
    order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS keyshares (
                                         vault_id TEXT NOT NULL,
                                         public_key TEXT NOT NULL,
                                         keyshare TEXT NOT NULL,
                                         FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);
CREATE TABLE Coins (
    id TEXT PRIMARY KEY,
    vault_id TEXT NOT NULL,
    chain TEXT NOT NULL,
    address TEXT NOT NULL,
    hex_public_key TEXT NOT NULL,
    ticker TEXT NOT NULL,
    contract_address TEXT NULL,
    is_native_token INTEGER NOT NULL DEFAULT 0,
    logo  TEXT NOT NULL,
    price_provider_id TEXT NOT NULL,
    decimals INTEGER NOT NULL,
    FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
);