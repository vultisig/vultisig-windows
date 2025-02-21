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
      chain TEXT,
      address TEXT,
      hex_public_key TEXT,
      ticker TEXT,
      contract_address TEXT,
      is_native_token INTEGER,
      logo TEXT,
      price_provider_id TEXT,
      decimals INTEGER,
      public_key_ecdsa TEXT,
      FOREIGN KEY(public_key_ecdsa) REFERENCES vaults(public_key_ecdsa) ON DELETE CASCADE
    );

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
