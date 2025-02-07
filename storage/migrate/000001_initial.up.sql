CREATE TABLE
    IF NOT EXISTS vaults (
        public_key_ecdsa TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        local_party_id TEXT NOT NULL,
        public_key_eddsa TEXT NOT NULL,
        hex_chain_code TEXT NOT NULL,
        reshare_prefix TEXT NOT NULL DEFAULT '',
        signers TEXT NOT NULL,
        is_backedup INTEGER NOT NULL DEFAULT 0,
        listorder INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS keyshares (
        public_key_ecdsa TEXT NOT NULL,
        public_key TEXT NOT NULL,
        keyshare TEXT NOT NULL,
        FOREIGN KEY (public_key_ecdsa) REFERENCES vaults (public_key_ecdsa) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS Coins (
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

CREATE TABLE
    IF NOT EXISTS settings (
        language TEXT NOT NULL,
        currency TEXT NOT NULL,
        default_chains TEXT NOT NULL
    );

INSERT INTO
    settings (language, currency, default_chains)
VALUES
    (
        'English',
        'USD',
        'ethereum,bitcoin,binance-smart-chain,solana'
    );

CREATE TABLE
    IF NOT EXISTS address_book (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        address TEXT NOT NULL,
        chain TEXT NOT NULL,
        "order" INTEGER NOT NULL
    );

CREATE INDEX IF NOT EXISTS idx_address_book_chain ON address_book (chain);

CREATE UNIQUE INDEX IF NOT EXISTS idx_address_book_address_chain ON address_book (address, chain);

CREATE INDEX IF NOT EXISTS idx_vaults_public_key_ecdsa ON vaults (public_key_ecdsa);

CREATE INDEX IF NOT EXISTS idx_keyshares_public_key_ecdsa ON keyshares (public_key_ecdsa);

CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa ON coins (public_key_ecdsa);

CREATE INDEX IF NOT EXISTS idx_coins_chain ON coins (chain);

CREATE INDEX IF NOT EXISTS idx_coins_ticker ON coins (ticker);

CREATE INDEX IF NOT EXISTS idx_coins_public_key_ecdsa_chain ON coins (public_key_ecdsa, chain);
