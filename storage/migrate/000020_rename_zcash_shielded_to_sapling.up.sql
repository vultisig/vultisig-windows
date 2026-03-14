UPDATE coins SET chain = 'ZcashSapling' WHERE chain = 'ZcashShielded';

UPDATE vaults
SET chain_public_keys = REPLACE(chain_public_keys, '"ZcashShielded"', '"ZcashSapling"')
WHERE chain_public_keys LIKE '%ZcashShielded%';

UPDATE vaults
SET chain_key_shares = REPLACE(chain_key_shares, '"ZcashShielded"', '"ZcashSapling"')
WHERE chain_key_shares LIKE '%ZcashShielded%';
