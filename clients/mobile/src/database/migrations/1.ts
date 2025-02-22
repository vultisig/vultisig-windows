export default {
  name: '1',
  up: `
    -- Create vault_folders table
    CREATE TABLE IF NOT EXISTS vault_folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "order" REAL
    );

    -- Create vaults table
    CREATE TABLE IF NOT EXISTS vaults (
      name TEXT,
      public_key_ecdsa TEXT PRIMARY KEY,
      public_key_eddsa TEXT,
      created_at TEXT,
      hex_chain_code TEXT,
      local_party_id TEXT,
      signers TEXT,
      reshare_prefix TEXT,
      "order" REAL,
      is_backedup INTEGER,
      folder_id TEXT,
      lib_type TEXT,
      FOREIGN KEY(folder_id) REFERENCES vault_folders(id) ON DELETE SET NULL
    );

    -- Create keyshares table
    CREATE TABLE IF NOT EXISTS keyshares (
      public_key_ecdsa TEXT,
      public_key TEXT,
      keyshare TEXT,
      PRIMARY KEY(public_key_ecdsa, public_key),
      FOREIGN KEY(public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
    );

    -- Create coins table
    CREATE TABLE IF NOT EXISTS coins (
      id TEXT PRIMARY KEY,
      chain TEXT NOT NULL,
      address TEXT NOT NULL,
      hex_public_key TEXT NOT NULL,
      ticker TEXT NOT NULL,
      contract_address TEXT,
      is_native_token INTEGER NOT NULL DEFAULT 0,
      logo TEXT,
      price_provider_id TEXT,
      decimals INTEGER NOT NULL,
      public_key_ecdsa TEXT NOT NULL,
      FOREIGN KEY(public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
    );
    CREATE INDEX idx_coins_chain_address ON coins(chain, address);
    CREATE INDEX idx_coins_public_key_ecdsa ON coins(public_key_ecdsa);

    -- Create address_book table (if you want)
    CREATE TABLE IF NOT EXISTS address_book (
      id TEXT PRIMARY KEY,
      title TEXT,
      address TEXT,
      chain TEXT,
      "order" REAL
    );
  `,
  down: `
    DROP TABLE IF EXISTS address_book;
    DROP TABLE IF EXISTS coins;
    DROP TABLE IF EXISTS keyshares;
    DROP TABLE IF EXISTS vaults;
    DROP TABLE IF EXISTS vault_folders;
  `,
}
