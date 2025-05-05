-- Revert address_book table to use UUID id
CREATE TABLE IF NOT EXISTS address_book_old (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    chain TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- Copy data from new table to old table, converting TEXT to UUID
INSERT INTO address_book_old (id, title, address, chain)
SELECT id, title, address, chain FROM address_book;

-- Drop old indices
DROP INDEX IF EXISTS idx_address_book_chain;
DROP INDEX IF EXISTS idx_address_book_address_chain;

-- Drop the new table
DROP TABLE IF EXISTS address_book;

-- Rename the old table to the original name
ALTER TABLE address_book_old RENAME TO address_book;

-- Recreate indices
CREATE INDEX IF NOT EXISTS idx_address_book_chain ON address_book (chain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_address_book_address_chain ON address_book (address, chain); 