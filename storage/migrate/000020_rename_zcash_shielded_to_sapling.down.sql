UPDATE coins SET chain = 'ZcashShielded' WHERE chain = 'ZcashSapling';

UPDATE vaults
SET chain_public_keys = REPLACE(chain_public_keys, '"ZcashSapling"', '"ZcashShielded"')
WHERE chain_public_keys LIKE '%ZcashSapling%';

UPDATE vaults
SET chain_key_shares = REPLACE(chain_key_shares, '"ZcashSapling"', '"ZcashShielded"')
WHERE chain_key_shares LIKE '%ZcashSapling%';
