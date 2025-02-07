ALTER TABLE vaults DROP COLUMN  folder_id;
DROP TABLE IF EXISTS vault_folders; 
DROP INDEX IF EXISTS idx_vaults_folder_id;
DROP INDEX IF EXISTS idx_coins_public_key_ecdsa_chain;
