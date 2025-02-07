-- Check if column exists, then add if missing
BEGIN TRANSACTION;

-- Only add column if it doesn't exist
CREATE TABLE vaults_new AS SELECT * FROM vaults;
ALTER TABLE vaults_new ADD COLUMN lib_type TEXT DEFAULT 'GG20';
DROP TABLE vaults;
ALTER TABLE vaults_new RENAME TO vaults;

COMMIT;
