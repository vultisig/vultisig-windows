-- Migrate address_book table to use string ID and consistent field naming
CREATE TABLE IF NOT EXISTS address_book_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    chain TEXT NOT NULL
);

-- Copy data from old table to new table, converting UUID to TEXT
INSERT INTO address_book_new (id, title, address, chain)
SELECT id, title, address, chain FROM address_book;

-- Drop old indices
DROP INDEX IF EXISTS idx_address_book_chain;
DROP INDEX IF EXISTS idx_address_book_address_chain;

-- Drop the old table
DROP TABLE IF EXISTS address_book;

-- Rename the new table to the original name
ALTER TABLE address_book_new RENAME TO address_book;

-- Recreate indices
CREATE INDEX IF NOT EXISTS idx_address_book_chain ON address_book (chain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_address_book_address_chain ON address_book (address, chain); 